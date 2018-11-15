import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema, GraphQLObjectType, GraphQLID } from 'graphql';
import { createContext } from 'dataloader-sequelize';
import { sequelize } from '../sequelize';
import { ContentType } from '../models/ContentType';
import { ContentTypeField } from '../models/ContentTypeField';
import { ContentEntryMeta } from '../types/ContentEntryMeta';
import { findAll } from './external/findAll';
import { find } from './external/find';
import { create } from './external/create';
import { update } from './external/update';
import { remove } from './external/remove';
import { resolveFieldType } from './external/types/resolveFieldType';

export const externalGraphql = async () => {

  const app = express();

  const inputs = {};
  const queries = {};

  const contentTypes = await ContentType.findAll();

  await Promise.all(
    contentTypes.map(async (contentType) => {
      contentType.fields = await contentType.$get('fields') as ContentTypeField[];

      const GraphQLContentType = new GraphQLObjectType({
        name: contentType.name,
        fields: () => ({
          _meta: { type: ContentEntryMeta },
          id: { type: GraphQLID },
          ...contentType.fields.reduce((acc, field: ContentTypeField) => {
            const FieldType = resolveFieldType(field);
            if (FieldType && FieldType.output) {
              acc[field.name] = FieldType.output(field, queries, contentTypes);
            }
            return acc;
          }, {}),
        }),
      });

      queries[contentType.name] = find(GraphQLContentType, contentType);
      queries[`all${contentType.name}`] = findAll(GraphQLContentType, contentType);

      inputs[`create${contentType.name}`] = create(GraphQLContentType, contentType, queries);
      inputs[`update${contentType.name}`] = update(GraphQLContentType, contentType, queries);
      inputs[`remove${contentType.name}`] = remove(GraphQLContentType, contentType);
    }),
  );

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queries,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: inputs,
    }),
  });

  const server = new ApolloServer({
    introspection: true,
    schema,
    context: async ({ req, connection }) => {
      const sequelizeDataLoader = createContext(sequelize);
      return { sequelizeDataLoader };
    },
  });

  server.applyMiddleware({ app });

  return app;
}
