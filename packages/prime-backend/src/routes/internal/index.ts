import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { attributeFields, resolver } from 'graphql-sequelize';
import { omit } from 'lodash';
import { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLInputObjectType, GraphQLBoolean, GraphQLID } from 'graphql';
import { ContentType } from '../../models/ContentType';
import { ContentTypeField } from '../../models/ContentTypeField';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeFieldGroup, getFields, setFields } from './processFields';
import * as GraphQLJSON from 'graphql-type-json';

export const internalGraphql = async (restart) => {

  const app = express();

  const ContentTypeFieldType = new GraphQLObjectType({
    name: 'ContentTypeField',
    fields: omit({
      ...attributeFields(ContentTypeField),
    }, ['contentTypeId']),
  });

  const ContentTypeType = new GraphQLObjectType({
    name: 'ContentType',
    fields: () => ({
      ...attributeFields(ContentType),
      fields: {
        type: new GraphQLList(ContentTypeFieldType),
        args: {
          limit: { type: GraphQLInt },
          order: { type: GraphQLString },
        },
        resolve: resolver(ContentTypeField, {
          before(opts, args, context, info) {
            opts.where = {
              contentTypeId: info.source.id,
            };
            return opts;
          }
        }),
      }
    }),
  });

  const ContentEntryType = new GraphQLObjectType({
    name: 'ContentEntry',
    fields: omit({
      ...attributeFields(ContentEntry),
      contentType: {
        type: ContentTypeType,
        resolve: resolver(ContentType),
      }
    }, ['contentTypeId']),
  });

  const queryFields = {
    getContentTypeSchema: {
      type: new GraphQLList(ContentTypeFieldGroup),
      args: {
        contentTypeId: { type: GraphQLID },
      },
      async resolve(root, args, context, info) {
        return await getFields(args.contentTypeId);
      }
    },
    allContentTypes: {
      type: new GraphQLList(ContentTypeType),
      args: {
        name: { type: GraphQLString },
        limit: { type: GraphQLInt },
        order: { type: GraphQLString },
      },
      resolve: resolver(ContentType),
    },
    allContentEntries: {
      type: new GraphQLList(ContentEntryType),
      args: {
        name: { type: GraphQLString },
        limit: { type: GraphQLInt },
        order: { type: GraphQLString },
      },
      resolve: resolver(ContentEntry),
    },
    ContentType: {
      type: ContentTypeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: resolver(ContentType),
    },
    ContentTypeField: {
      type: ContentTypeFieldType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: resolver(ContentTypeField),
    },
    ContentEntry: {
      type: ContentEntryType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: resolver(ContentEntry),
    },
  };

  const mutationFields = {
    setContentTypeSchema: {
      type: GraphQLBoolean,
      args: {
        contentTypeId: { type: GraphQLID },
        schema: { type: GraphQLJSON },
      },
      async resolve(root, args, context, info) {
        await setFields(args.contentTypeId, args.schema);
        restart();
        return true;
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
              name: { type: GraphQLString },
            },
          }),
        }
      },
      async resolve(root, args, context, info) {
        const entry = await ContentType.create({
          name: args.input.name,
          title: args.input.title,
        });
        restart();
        return entry;
      }
    },
    removeContentType: {
      type: GraphQLBoolean,
      args: {
        id: { type: GraphQLID },
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
              group: { type: GraphQLString },
            },
          }),
        },
      },
      async resolve(root, args, context, info) {

        const contentType = await ContentType.findById(
          args.input.contentTypeId
        );

        if (!contentType) {
          throw new Error("Content Type not valid");
        }

        const entry = await ContentTypeField.create({
          contentTypeId: contentType.id,
          name: args.input.name,
          title: args.input.title,
          type: args.input.type,
          group: args.input.group,
        });

        restart();

        return entry;
      }
    },
  };

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  });

  const server = new ApolloServer({
    introspection: true,
    schema,
  });

  server.applyMiddleware({ app });

  return app;
};
