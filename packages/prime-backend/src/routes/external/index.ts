import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema, GraphQLObjectType, GraphQLID } from 'graphql';
import { createContext } from 'dataloader-sequelize';
import { sequelize } from '../../sequelize';
import { ContentType } from '../../models/ContentType';
import { ContentTypeField } from '../../models/ContentTypeField';
import { ContentEntryMeta } from '../../types/ContentEntryMeta';
import { findAll } from './findAll';
import { find } from './find';
import { create } from './create';
import { update } from './update';
import { remove } from './remove';
import { resolveFieldType } from './types/resolveFieldType';
import { User } from '../../models/User';
import { acl } from '../../acl';

export const externalGraphql = async () => {

  const app = express();
  const debug = require('debug')('prime:graphql');

  const inputs = {};
  const queries = {};

  const contentTypes = await ContentType.findAll();

  debug(contentTypes.length, 'content types');

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

      debug('created content type:', contentType.name + '(' + contentType.fields.map(field => field.name).join(', ') + ')');

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
    tracing: true,
    schema,
    context: async ({ req, connection }) => {
      const context = {} as any;
      context.sequelizeDataLoader = createContext(sequelize);
      const token = req.headers.authorization || '';

      // Make the entire API public
      context.public = true;

      if (!token || token === '') {
        debug('context: no token');
      } else {
        const user = await User.findOne({
          where: {
            refreshToken: token.replace(/^Bearer /, '').trim(),
          },
        });
        if (user) {
          debug('context: user', user.email);
          debug('context: roles', await acl.userRoles(user.id));
          context.user = user;
        } else {
          debug('context: invalid token');
        }
      }

      return context;
    },
  });

  server.applyMiddleware({ app });

  return app;
}
