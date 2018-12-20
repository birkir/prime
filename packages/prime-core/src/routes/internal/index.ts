import { ApolloServer, AuthenticationError, UserInputError } from 'apollo-server-express';
import * as express from 'express';
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList,
  GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLEnumType } from 'graphql';
import { attributeFields, DateType, relay, resolver } from 'graphql-sequelize';
import * as GraphQLJSON from 'graphql-type-json';
import { get, uniq, omit, pickBy } from 'lodash';
import { fields } from '../../fields';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentType } from '../../models/ContentType';
import { ContentTypeField } from '../../models/ContentTypeField';
import { pageInfoType } from '../../types/pageInfoType';
import { latestVersion } from '../external/utils/latestVersion';
import { ContentTypeFieldGroup, ContentTypeFieldGroupInputType,
  getFields, setFields } from './processFields';
import { User } from '../../models/User';
import { EntryTransformer } from '../../utils/entryTransformer';
import { Sentry } from '../../utils/Sentry';
import { Settings } from '../../models/Settings';
import { sequelize } from '../../sequelize';
import { GraphQLSettingsInput } from '../../types/settings';
import { algolia } from '../../utils/algolia';
import { acl } from '../../acl';

const entryTransformer = new EntryTransformer();

// tslint:disable max-func-body-length export-name await-promise
export const internalGraphql = async (restart) => {

  const app = express();

  const contentTypeFieldType = new GraphQLObjectType({
    name: 'ContentTypeField',
    fields: omit(
      attributeFields(ContentTypeField),
      ['contentTypeId']
    )
  });

  const userType = new GraphQLObjectType({
    name: 'User',
    fields: {
      ...omit(attributeFields(User), ['password']),
      roles: { type: new GraphQLList(GraphQLString) },
    },
  });

  const contentTypeType = new GraphQLObjectType({
    name: 'ContentType',
    fields: () => ({
      ...attributeFields(ContentType),
      fields: {
        type: new GraphQLList(contentTypeFieldType),
        args: {
          limit: { type: GraphQLInt },
          order: { type: GraphQLString }
        },
        resolve: resolver(ContentTypeField, {
          before(opts, args, context, info) {
            opts.where = {
              contentTypeId: info.source.id
            };

            return opts;
          }
        })
      },
      entriesCount: { type: GraphQLInt },
    })
  });

  const contentEntryType = new GraphQLObjectType({
    name: 'ContentEntry',
    fields: omit({
      ...attributeFields(ContentEntry),
      contentType: {
        type: contentTypeType,
        resolve: resolver(ContentType, {
          before(opts, args, context, info) {
            opts.where = {
              id: info.source.contentTypeId
            };

            return opts;
          }
        })
      },
      user: {
        type: userType,
        resolve: resolver(User, {
          before(opts, args, context, info) {
            opts.where = {
              id: info.source.userId
            };

            return opts;
          }
        })
      },
      display: { type: GraphQLString },
      publishedVersionId: { type: GraphQLID },
      versions: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: 'Version',
            fields: {
              versionId: { type: GraphQLID },
              isPublished: { type: GraphQLBoolean },
              createdAt: { type: DateType.default },
              updatedAt: { type: DateType.default }
            }
          })
        )
      }
    })
  });

  const contentEntryConnectionEdgeType = new GraphQLObjectType({
    name: 'ContentEntryConnectionEdge',
    fields: {
      node: { type: contentEntryType },
      cursor: { type: GraphQLString }
    }
  });

  const contentEntryConnectionType = new GraphQLObjectType({
    name: 'ContentEntryConnection',
    fields: {
      pageInfo: { type: pageInfoType },
      totalCount: { type: GraphQLInt },
      edges: {
        type: new GraphQLList(contentEntryConnectionEdgeType)
      }
    }
  });

  const allContentEntries = {
    type: contentEntryConnectionType,
    args: {
      contentTypeId: { type: GraphQLID },
      language: { type: GraphQLString },
      userId: { type: GraphQLString },
      limit: { type: GraphQLInt },
      skip: { type: GraphQLInt },
      sort: {
        type: new GraphQLEnumType({
          name: 'SortField',
          values: {
            userId: { value: 'userId' },
            entryId: { value: 'entryId' },
            contentTypeId: { value: 'contentTypeId' },
            updatedAt: { value: 'updatedAt' },
            createdAt: { value: 'createdAt' },
          }
        }),
      },
      order: {
        type: new GraphQLEnumType({
          name: 'SortOrder',
          values: {
            ASC: { value: 'ASC' },
            DESC: { value: 'DESC' },
          }
        }),
      }
    },
    resolve: relay.createConnectionResolver({
      target: ContentEntry,
      before: (findOptions, args, context) => {
        const language = args.language || 'en';
        const published = null;
        const contentReleaseId = null;

        findOptions.attributes = {
          include: [
            [
              sequelize.literal(`(SELECT "versionId" "vId" from "ContentEntry" "b" WHERE "b"."entryId" = "ContentEntry"."entryId" AND "b"."isPublished" = true AND "b"."language" = ${sequelize.escape(language)} ORDER BY "updatedAt" DESC LIMIT 1)`),
              'publishedVersionId'
            ],
          ]
        };

        findOptions.having = {
          versionId: latestVersion({ language, published, contentReleaseId }),
        };

        if (args.contentTypeId) {
          findOptions.where.contentTypeId = args.contentTypeId;
        }

        if (args.userId) {
          findOptions.where.userId = args.userId;
        }

        const order = args.order || 'DESC';
        const sort = args.sort || 'updatedAt';

        findOptions.order = [[sort, order]];
        findOptions.offset = args.skip;
        findOptions.group = ['versionId'];

        return findOptions;
      },
      async after(values, args, context, info) {
        if (args.contentTypeId) {
          values.where.contentTypeId = args.contentTypeId;
        }
        const totalCount = await ContentEntry.count({
          distinct: true,
          col: 'entryId',
          where: {
            ...values.where,
            language: args.language,
          },
        });
        values.totalCount = totalCount;

        const contentTypeDisplay = new Map();
        const contentTypeIds = uniq(values.edges.map(edge => edge.node.contentTypeId));
        await Promise.all(
          contentTypeIds.map(async (contentTypeId) => {
            const displayField = await ContentTypeField.findOne({
              where: {
                contentTypeId,
                isDisplay: true,
              }
            });
            if (displayField) {
              contentTypeDisplay.set(contentTypeId, displayField.name);
            }
          })
        );

        entryTransformer.resetTransformCache();

        await Promise.all(values.edges.map(async (edge) => {
          const { node } = edge;

          node.data = await entryTransformer.transformOutput(node.data, node.contentTypeId);

          if (contentTypeDisplay.has(node.contentTypeId)) {
            const displayFieldValue = get(node.data, contentTypeDisplay.get(node.contentTypeId), '');
            node.display = displayFieldValue;
          } else {
            const dataKeys = Object.keys(node.data);
            node.display = get(node.data, 'title', get(node.data, 'name', get(node.data, dataKeys[0], node.entryId)));
          }

          node.publishedVersionId = node.dataValues.publishedVersionId;
        }));

        return values;
      }
    }).resolveConnection
  };

  const fieldObjectType = new GraphQLObjectType({
    name: 'Field',
    fields: {
      id: { type: GraphQLID },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      defaultOptions: { type: GraphQLJSON },
      ui: { type: GraphQLString }
    }
  });

  const allFields = {
    type: new GraphQLList(fieldObjectType),
    resolve() {
      return fields;
    }
  };

  const queryFields = {
    getSettings: {
      type: GraphQLJSON,
      async resolve() {
        const settings = await Settings.get();

        return {
          env: pickBy(process.env, (val, key: string) => key.indexOf('PRIME_') === 0),
          ...settings,
        };
      },
    },
    getContentTypeSchema: {
      type: new GraphQLList(ContentTypeFieldGroup),
      args: {
        entryId: { type: GraphQLID },
        contentTypeId: { type: GraphQLID }
      },
      async resolve(root, args, context, info) {
        if (args.entryId && !args.contentTypeId) {
          const entry = await ContentEntry.findOne({
            where: {
              entryId: args.entryId
            }
          });
          if (!entry || !entry.contentTypeId) {
            return null;
          }
          args.contentTypeId = entry.contentTypeId;
        }

        return getFields(args.contentTypeId);
      }
    },
    allContentTypes: {
      type: new GraphQLList(contentTypeType),
      args: {
        limit: { type: GraphQLInt },
        order: { type: GraphQLString }
      },
      resolve: resolver(ContentType, {
        async after(result, args, context, info) {
          await Promise.all(result.map(async res => {
            if (!res.isSlice) {
              res.entriesCount = await ContentEntry.count({
                distinct: true,
                col: 'entryId',
                where: {
                  contentTypeId: res.id
                },
              });
            }
          }));
          return result;
        }
      })
    },
    allFields,
    allContentEntries,
    allUsers: {
      type: new GraphQLList(userType),
      resolve: resolver(User, {
        async after(users) {
          return await Promise.all(users.map(async user => {
            user.roles = await acl.userRoles(user.id);
            return user;
          }));
        }
      }),
    },
    ContentType: {
      type: contentTypeType,
      args: {
        id: { type: GraphQLID }
      },
      resolve: resolver(ContentType, {
        before(opts, args, context) {
          opts.where = {
            id: args.id
          };

          return opts;
        }
      })
    },
    ContentTypeField: {
      type: contentTypeFieldType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: resolver(ContentTypeField)
    },
    ContentEntry: {
      type: contentEntryType,
      args: {
        entryId: { type: GraphQLID },
        versionId: { type: GraphQLID },
        language: { type: GraphQLString },
      },
      resolve: resolver(ContentEntry, {
        before(opts, args, context) {
          opts.where = {
            entryId: args.entryId
          };

          if (args.language) {
            opts.where.language = args.language;
          }

          opts.order = [
            ['createdAt', 'DESC']
          ];

          return opts;
        },
        async after(result, args, context) {

          if (!result && args.language) {
            result = await ContentEntry.findOne({
              where: {
                entryId: args.entryId,
              }
            });
            result.versionId = null;
            result.isPublished = false;
            result.language = args.language;
            result.data = {};
            result.versions = [];
          } else {
            result.versions = await ContentEntry.findAll({
              attributes: [
                'versionId',
                'isPublished',
                'createdAt',
                'updatedAt'
              ],
              where: {
                entryId: args.entryId,
                language: result.language
              },
              order: [
                ['createdAt', 'DESC']
              ]
            });

            entryTransformer.resetTransformCache();
            result.data = entryTransformer.transformOutput(result.data, result.contentTypeId);
          }

          return result;
        }
      })
    }
  };

  const mutationFields = {
    setSettings: {
      type: GraphQLBoolean,
      args: {
        input: { type: GraphQLSettingsInput },
      },
      async resolve(root, args, context, info) {
        const done = await Settings.create({
          data: args.input,
          userId: context.user.id,
        });

        return Boolean(done);
      },
    },
    setContentTypeSchema: {
      type: GraphQLBoolean,
      args: {
        contentTypeId: { type: new GraphQLNonNull(GraphQLID) },
        schema: { type: new GraphQLNonNull(new GraphQLList(ContentTypeFieldGroupInputType)) },
      },
      async resolve(root, args, context, info) {
        await setFields(args.contentTypeId, args.schema);
        restart();

        return true;
      }
    },
    syncAlgolia: {
      type: GraphQLBoolean,
      async resolve(root, args, context, info) {
        if (!algolia.index) {
          throw new Error('No algolia client configured');
        }

        await algolia.index.clearIndex();

        const entries = await ContentEntry.findAll({
          attributes: [
            'entryId',
            [sequelize.literal('(SELECT "versionId" FROM "ContentEntry" "ce" WHERE "ce"."entryId" = "ContentEntry"."entryId" AND "isPublished" = TRUE ORDER BY "updatedAt" LIMIT 1)'), 'versionId']
          ],
          where: { isPublished: true },
          group: ['entryId', 'language']
        });

        entryTransformer.resetTransformCache();

        await Promise.all(entries.map(async ({ versionId }) => {
          const entry = await ContentEntry.findOne({ where: { versionId } });
          if (entry) {
            const doc = await entryTransformer.transformOutput(entry.data, entry.contentTypeId);
            algolia.index.saveObject({
              objectID: `${entry.entryId}-${entry.language}`,
              _entryId: entry.entryId,
              _language: entry.language,
              ...doc,
            });
          }
        }));

      },
    },
    createUser: {
      type: userType,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: 'CreateUserInput',
            fields: {
              firstname: { type: GraphQLString },
              lastname: { type: GraphQLString },
              email: { type: new GraphQLNonNull(GraphQLString) },
              password: { type: new GraphQLNonNull(GraphQLString) },
              roles: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
            }
          })
        },
      },
      async resolve(root, args, context, info) {
        const user = await User.create({
          firstname: args.input.firstname,
          lastname: args.input.lastname,
          email: args.input.email,
          password: args.input.password,
        });
        if (user) {
          await acl.addUserRoles(user.id, args.input.roles);
          (user as any).roles = args.input.roles;
        }
        return user;
      },
    },
    removeUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(root, args, context, info) {
        if (context.user.id === args.id) {
          throw new UserInputError('You can not remove yourself');
        }
        // @todo acl
        const success = await User.destroy({ where: { id: args.id }});
        // @todo nuke roles and so on
        return Boolean(success);
      },
    },
    updateProfile: {
      type: GraphQLBoolean,
      args: {
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        displayName: { type: GraphQLString },
        avatarUrl: { type: GraphQLString },
      },
      async resolve(root, args, context, info) {
        const success = await context.user.update({
          firstname: args.firstname,
          lasstname: args.lastname,
          displayName: args.displayName,
          avatarUrl: args.avatarUrl,
        });
        return Boolean(success);
      },
    },
    updatePassword: {
      type: GraphQLBoolean,
      args: {
        oldpassword: { type: new GraphQLNonNull(GraphQLString) },
        newpassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(root, args, context, info) {
        if (!context.user.isPasswordMatch(args.oldpassword)) {
          throw new UserInputError('Incorrect password');
        }
        const success = await context.user.updatePassword(args.newpassword);
        await context.user.update({ lastPasswordChange: new Date() });
        return Boolean(success);
      },
    },
    updateEmail: {
      type: GraphQLBoolean,
      args: {
        oldpassword: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(root, args, context, info) {
        if (!context.user.isPasswordMatch(args.oldpassword)) {
          throw new UserInputError('Incorrect password');
        }
        const exists = await User.count({ where: { email: args.email }});
        if (exists > 0) {
          throw new UserInputError('Email already in use');
        }
        const success = await context.user.update({
          email: args.email,
        })
        return Boolean(success);
      },
    },
    createContentType: {
      type: queryFields.ContentType.type,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: 'CreateContentTypeInput',
            fields: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              name: { type: new GraphQLNonNull(GraphQLString) },
              isSlice: { type: GraphQLBoolean },
              isTemplate: { type: GraphQLBoolean },
              settings: { type: GraphQLJSON },
            }
          })
        }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentType.create({
          name: args.input.name,
          title: args.input.title,
          isSlice: args.input.isSlice,
          isTemplate: args.input.isTemplate,
          settings: args.input.settings,
          userId: context.user.id,
        });
        restart();

        return entry;
      }
    },
    updateContentType: {
      type: queryFields.ContentType.type,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: {
          type: new GraphQLInputObjectType({
            name: 'UpdateContentTypeInput',
            fields: {
              name: { type: new GraphQLNonNull(GraphQLString) },
              title: { type: new GraphQLNonNull(GraphQLString) },
              settings: { type: GraphQLJSON },
            }
          })
        }
      },
      async resolve(root, args, context, info) {
        const contentType = await ContentType.findOne({
          where: { id: args.id },
        });

        if (contentType) {
          const { title, name, settings } = args.input;

          await contentType.update({
            title,
            name,
            settings,
          })
          restart();
        }

        return contentType;
      }
    },
    removeContentType: {
      type: GraphQLBoolean,
      args: {
        id: { type: GraphQLID }
      },
      async resolve(root, args, context, info) {
        const contentType = await ContentType.findById(args.id);
        if (contentType) {
          await contentType.destroy();
          restart();

          return true;
        }

        return false;
      }
    },
    updateContentEntry: {
      type: contentEntryType,
      args: {
        entryId: { type: new GraphQLNonNull(GraphQLID) },
        language: { type: GraphQLString },
        data: { type: GraphQLJSON }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentEntry.findOne({
          where: {
            entryId: args.entryId
          },
          order: [
            ['createdAt', 'DESC']
          ]
        });

        if (entry) {

          entryTransformer.resetTransformCache();

          if (args.data) {
            args.data = await entryTransformer.transformInput(args.data, entry.contentTypeId);
          }

          const updatedEntry = await entry.draft(args.data, args.language || 'en', context.user.id);

          updatedEntry.data = await entryTransformer.transformOutput(updatedEntry.data, entry.contentTypeId);

          return updatedEntry;
        }

        return null;
      }
    },
    createContentEntry: {
      type: contentEntryType,
      args: {
        contentTypeId: { type: new GraphQLNonNull(GraphQLID) },
        language: { type: GraphQLString },
        data: { type: GraphQLJSON }
      },
      async resolve(root, args, context, info) {

        entryTransformer.resetTransformCache();

        if (args.data) {
          args.data = await entryTransformer.transformInput(args.data, args.contentTypeId);
        }

        const entry = await ContentEntry.create({
          isPublished: false,
          contentTypeId: args.contentTypeId,
          language: args.language || 'en',
          data: args.data,
          userId: context.user.id
        });

        entry.data = await entryTransformer.transformOutput(entry.data, args.contentTypeId);

        return entry;
      }
    },
    unpublishContentEntry: {
      type: contentEntryType,
      args: {
        versionId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentEntry.findOne({
          where: {
            versionId: args.versionId
          }
        });

        entryTransformer.resetTransformCache();

        if (entry) {
          await ContentEntry.update({
            isPublished: false
          }, {
            where: {
              entryId: entry.entryId,
              language: entry.language,
            }
          });
          return {
            ...entry.dataValues,
            isPublished: false,
            data: await entryTransformer.transformOutput(entry.data, entry.contentTypeId),
            versions: await ContentEntry.findAll({
              attributes: [
                'versionId',
                'isPublished',
                'createdAt',
                'updatedAt'
              ],
              where: {
                entryId: args.entryId,
                language: entry.language
              },
              order: [
                ['createdAt', 'DESC']
              ]
            }),
          };
        }
      }
    },
    publishContentEntry: {
      type: contentEntryType,
      args: {
        versionId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentEntry.findOne({
          where: {
            versionId: args.versionId
          }
        });

        entryTransformer.resetTransformCache();

        if (entry) {
          const publishedEntry = await entry.publish(context.user.id);
          publishedEntry.data = await entryTransformer.transformOutput(publishedEntry.data, publishedEntry.contentTypeId);

          if (algolia.index) {
            algolia.index.saveObject({
              objectID: `${entry.entryId}-${entry.language}`,
              _entryId: entry.entryId,
              _language: entry.language,
              ...publishedEntry.data,
            });
          }

          return publishedEntry;
        }

        return false;
      }
    },
    removeContentEntry: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        language: { type: GraphQLString },
      },
      async resolve(root, args, context, info) {
        const where: any = {
          entryId: args.id,
        };
        if (args.language) {
          where.language = args.language;
          if (algolia.index) {
            await algolia.index.deleteObject(args.id);
          }
        } else if (algolia.index) {
          await algolia.index.deleteBy({ filters: `_entryId:${args.id}` });
        }
        const success = await ContentEntry.destroy({ where });
        return Boolean(success);
      },
    }
  };

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields
    })
  });

  const server = new ApolloServer({
    introspection: true,
    playground: false,
    schema,
    context: async ({ req }) => {
      const { user } = req;
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      if (Sentry) {
        Sentry.configureScope(scope => {
          if (user) {
            scope.setUser({ id: user.id });
          }
        });
      }

      return { user };
    },
    formatError(error) {
      if (Sentry) {
        Sentry.captureException(error);
      }

      return error;
    }
  });

  server.applyMiddleware({
    app,
    cors: {
      origin: true
    }
  });

  return app;
};
