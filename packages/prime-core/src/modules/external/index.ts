import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { GraphQLBoolean, GraphQLObjectType, GraphQLSchema, printSchema } from 'graphql';
import Container from 'typedi';
import { Connection, getRepository } from 'typeorm';
import { Schema } from '../../entities/Schema';
import { DocumentTransformer } from '../../utils/DocumentTransformer';
import { createFindResolver } from './resolvers/createFindResolver';
import { createSchemaType } from './types/createSchemaType';
import { clearTypeNames, uniqueTypeName } from './utils/uniqueTypeNames';

export const log = debug('prime:external');

export const createExternal = async (connection: Connection) => {
  log('building schema');
  clearTypeNames();

  const documentTransformer = new DocumentTransformer();
  const schemas = await getRepository(Schema).find();

  const queries = {};
  const resolvers = {};

  for (const schema of schemas) {
    const fields = await documentTransformer.getFields(schema);
    const name = uniqueTypeName(schema.name);
    resolvers[name] = await createFindResolver({ schema });
    queries[name] = await createSchemaType({ schema, fields, name, resolvers });
  }

  const typeDefs = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        hello: { type: GraphQLBoolean },
        ...queries,
      },
    }),
  });

  return new GraphQLModule({
    name: 'prime-external',
    typeDefs: printSchema(typeDefs),
    resolvers: {
      Query: {
        hello: () => true,
        ...resolvers,
      },
    },
    context() {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      log('requestId', requestId);
      const container = Container.of(requestId);
      const ctx = {
        requestId,
        container,
      };
      container.set('context', ctx);
      return ctx;
    },
  });
};
