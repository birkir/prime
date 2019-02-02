import { GraphQLModule } from '@graphql-modules/core';
import { PrimeFieldOperation } from '@primecms/field';
import debug from 'debug';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  printSchema,
} from 'graphql';
import { camelCase, omit, pick, upperFirst } from 'lodash';
import Container from 'typedi';
import { Connection, getRepository } from 'typeorm';
import { Schema, SchemaVariant } from '../../entities/Schema';
import { DocumentTransformer } from '../../utils/DocumentTransformer';
import { createAllDocumentResolver } from './resolvers/createAllDocumentResolver';
import { createDocumentCreateResolver } from './resolvers/createDocumentCreateResolver';
import { createDocumentRemoveResolver } from './resolvers/createDocumentRemoveResolver';
import { createDocumentResolver } from './resolvers/createDocumentResolver';
import { createDocumentUpdateResolver } from './resolvers/createDocumentUpdateResolver';
import { documentUnionResolver } from './resolvers/documentUnionResolver';
import { createSchemaConnectionType } from './types/createSchemaConnectionType';
import { createSchemaInputType } from './types/createSchemaInputType';
import { createSchemaType } from './types/createSchemaType';
import { DocumentRemove } from './types/DocumentRemove';
import { resetTypeNames, uniqueTypeName } from './utils/uniqueTypeNames';

export const log = debug('prime:external');

export const getDefaultLocale = () => 'en';

export const createExternal = async (connection: Connection) => {
  log('building schema');
  resetTypeNames();

  const documentTransformer = new DocumentTransformer();
  const schemas = await getRepository(Schema).find();

  const PrimeDocumentNotFound = new GraphQLObjectType({
    name: uniqueTypeName('PrimeDocument_NotFound'),
    fields: { message: { type: GraphQLString } },
  });

  const types: GraphQLObjectType[] = [PrimeDocumentNotFound];

  const queries: { [key: string]: any } = {};
  const mutations: { [key: string]: any } = {};
  const resolvers: { [key: string]: any } = {};

  for (const schema of schemas) {
    if (schema.variant !== SchemaVariant.Default) {
      continue;
    }

    const fields = await documentTransformer.getFields(schema);
    const name = uniqueTypeName(upperFirst(camelCase(schema.name)));
    const payload = { schema, fields, name, resolvers, documentTransformer };
    const SchemaTypeConfig = await createSchemaType(payload);
    const SchemaType = SchemaTypeConfig.type;
    const { CREATE, UPDATE } = PrimeFieldOperation;

    if (!SchemaType || Object.keys(omit(SchemaType.getFields(), ['id', '_meta'])).length === 0) {
      continue;
    }

    resolvers[name] = await createDocumentResolver(payload);
    resolvers[`all${name}`] = await createAllDocumentResolver(payload);
    resolvers[`create${name}`] = await createDocumentCreateResolver(payload);
    resolvers[`update${name}`] = await createDocumentUpdateResolver(payload);
    resolvers[`remove${name}`] = await createDocumentRemoveResolver(payload);

    queries[name] = SchemaTypeConfig;
    queries[`all${name}`] = await createSchemaConnectionType(payload, SchemaType);

    mutations[`create${name}`] = await createSchemaInputType(payload, SchemaType, CREATE);
    mutations[`update${name}`] = await createSchemaInputType(payload, SchemaType, UPDATE);
    mutations[`remove${name}`] = DocumentRemove;

    types.push(SchemaType);
  }

  queries.PrimeDocument = {
    args: {
      id: { type: GraphQLString },
      locale: { type: GraphQLString },
    },
    type: new GraphQLUnionType({
      name: uniqueTypeName('PrimeDocument'),
      types,
    }),
  };

  resolvers.PrimeDocument = documentUnionResolver(resolvers);

  const hasMutations = Object.keys(mutations).length;

  const typeDefs = printSchema(
    new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: queries,
      }),
      ...(hasMutations && {
        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: mutations,
        }),
      }),
    })
  );

  return new GraphQLModule({
    name: 'prime-external',
    typeDefs,
    resolvers: {
      Query: {
        PrimeDocument: queries.PrimeDocument,
        ...pick(resolvers, Object.keys(queries)),
      },
      ...(hasMutations && { Mutation: pick(resolvers, Object.keys(mutations)) }),
      PrimeDocument: {
        __resolveType({ __typeOf }) {
          return __typeOf;
        },
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
