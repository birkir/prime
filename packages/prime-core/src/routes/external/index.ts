import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema, GraphQLObjectType, GraphQLID, GraphQLBoolean } from 'graphql';
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
import { resolveFieldType } from './utils/resolveFieldType';
// import { User } from '../../models/User';
// import { acl } from '../../acl';

export const debug = require('debug')('prime:graphql');

export const externalGraphql = async () => {

  const app = express();

  const queries = {};
  const inputs = {};

  const contentTypes = await ContentType.findAll();

  debug(contentTypes.length, 'content types');

  await Promise.all(
    contentTypes.map(async (contentType) => {
      contentType.fields = await contentType.$get('fields') as ContentTypeField[];
    })
  );

  await Promise.all(
    contentTypes.map(async (contentType) => {
      const GraphQLContentType = new GraphQLObjectType({
        name: contentType.name,
        fields: () => ({
          _meta: { type: ContentEntryMeta },
          id: { type: GraphQLID },
          ...contentType.fields.reduce((acc, field: ContentTypeField) => {
            const FieldType = resolveFieldType(field);
            if (FieldType && FieldType.GraphQL) {
              acc[field.name] = FieldType.GraphQL({
                field,
                queries,
                contentType,
                contentTypes,
                resolveFieldType,
              });
            }
            if (!acc[field.name]) {
              delete acc[field.name];
            }
            return acc;
          }, {}),
        }),
      });

      if (contentType.isSlice) {
        debug('content type %s is a slice', contentType.id);
        return null;
      }

      debug('created content type:', contentType.name + '(' + contentType.fields.map(field => field.name).join(', ') + ')');

      queries[contentType.name]             = find({ GraphQLContentType, contentType, contentTypes, queries });
      queries[`all${contentType.name}`]  = findAll({ GraphQLContentType, contentType, contentTypes, queries });
      inputs[`create${contentType.name}`] = create({ GraphQLContentType, contentType, contentTypes, queries });
      inputs[`update${contentType.name}`] = update({ GraphQLContentType, contentType, contentTypes, queries });
      inputs[`remove${contentType.name}`] = remove({ GraphQLContentType, contentType, contentTypes, queries });
    }),
  );

  const queriesAndMutations: any = {};

  if (Object.keys(queries).length === 0) {
    (queries as any).isEmpty = {
      type: GraphQLBoolean,
      resolve() {
        return true;
      }
    };
  } else {
    queriesAndMutations.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: inputs,
    });
  }

  queriesAndMutations.query = new GraphQLObjectType({
    name: 'Query',
    fields: queries,
  });

  const schema = new GraphQLSchema(queriesAndMutations);

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
        debug('invalid token');
        // const user = await User.findOne({});
        // if (user) {
        //   debug('context: user', user.email);
        //   debug('context: roles', await acl.userRoles(user.id));
        //   context.user = user;
        // } else {
        //   debug('context: invalid token');
        // }
      }


      // Some flags that will have to become globally on the requests (Cookie etc.)
      // Published flag
      context.published = true;
      // Given release?
      context.contentReleaseId = null;

      return context;
    },
  });

  server.applyMiddleware({ app });

  return app;
}
