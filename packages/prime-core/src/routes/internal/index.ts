import { ApolloServer, AuthenticationError } from 'apollo-server-express';
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
      }
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
      display: { type: GraphQLString },
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
      limit: { type: GraphQLInt },
      skip: { type: GraphQLInt },
      sort: {
        type: new GraphQLEnumType({
          name: 'SortField',
          values: {
            entryId: { value: 'entryId' },
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
        findOptions.having = {
          versionId: latestVersion({ language, published, contentReleaseId })
        };
        if (args.contentTypeId) {
          findOptions.where.contentTypeId = args.contentTypeId;
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

        values.edges.forEach(edge => {
          const { node } = edge;

          if (contentTypeDisplay.has(node.contentTypeId)) {
            const displayFieldValue = get(node.data, contentTypeDisplay.get(node.contentTypeId), '');
            node.display = displayFieldValue;
          } else {
            const dataKeys = Object.keys(node.data);
            node.display = get(node.data, 'title', get(node.data, 'name', get(node.data, dataKeys[0], node.entryId)));
          }
        });

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
    getConfig: {
      type: GraphQLJSON,
      async resolve() {
        return pickBy(process.env, (val, key: string) => key.indexOf('PRIME_') === 0);
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
      resolve: resolver(ContentType)
    },
    allFields,
    allContentEntries,
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
          }

          return result;
        }
      })
    }
  };

  const mutationFields = {
    setContentTypeSchema: {
      type: GraphQLBoolean,
      args: {
        contentTypeId: { type: new GraphQLNonNull(GraphQLID) },
        schema: { type: new GraphQLNonNull(new GraphQLList(ContentTypeFieldGroupInputType)) }
      },
      async resolve(root, args, context, info) {
        await setFields(args.contentTypeId, args.schema);
        restart();

        return true;
      }
    },
    createContentType: {
      type: queryFields.ContentType.type,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: 'CreateContentTypeInput',
            fields: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              name: { type: GraphQLString },
              isSlice: { type: GraphQLBoolean }
            }
          })
        }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentType.create({
          name: args.input.name,
          title: args.input.title,
          isSlice: args.input.isSlice
        });
        restart();

        return entry;
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
          return entry.draft(args.data, args.language || 'en');
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
        return ContentEntry.create({
          isPublished: false,
          contentTypeId: args.contentTypeId,
          language: args.language || 'en',
          data: args.data
        });
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

        if (entry) {
          return entry.publish();
        }

        return false;
      }
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
        throw new AuthenticationError('Not logged in');
      }

      return { user };
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
