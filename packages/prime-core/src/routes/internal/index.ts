import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import * as express from 'express';
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList,
  GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { attributeFields, DateType, relay, resolver } from 'graphql-sequelize';
import * as GraphQLJSON from 'graphql-type-json';
import { omit, pickBy } from 'lodash';
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
      order: { type: GraphQLString }
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
          where: values.where
        });
        values.totalCount = totalCount;

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
        versionId: { type: GraphQLID }
      },
      resolve: resolver(ContentEntry, {
        before(opts, args, context) {
          opts.where = {
            entryId: args.entryId
          };
          opts.order = [
            ['createdAt', 'DESC']
          ];

          return opts;
        },
        async after(result, args, context) {
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
    createContentTypeField: {
      type: queryFields.ContentTypeField.type,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: 'CreateContentTypeFieldInput',
            fields: {
              contentTypeId: { type: new GraphQLNonNull(GraphQLString) },
              name: { type: new GraphQLNonNull(GraphQLString) },
              title: { type: GraphQLString },
              type: { type: new GraphQLNonNull(GraphQLString) },
              group: { type: GraphQLString }
            }
          })
        }
      },
      async resolve(root, args, context, info) {

        const contentType = await ContentType.findById(
          args.input.contentTypeId
        );

        if (!contentType) {
          throw new Error('Content Type not valid');
        }

        const entry = await ContentTypeField.create({
          contentTypeId: contentType.id,
          name: args.input.name,
          title: args.input.title,
          type: args.input.type,
          group: args.input.group
        });

        restart();

        return entry;
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
    introspection: false,
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
