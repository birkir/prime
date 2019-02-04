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

  const types = new Map();
  const queries: { [key: string]: any } = {};
  const mutations: { [key: string]: any } = {};
  const resolvers: { [key: string]: any } = {};

  for (const schema of schemas) {
    if (schema.variant === SchemaVariant.Template) {
      continue;
    }

    if (schema.variant === SchemaVariant.Slice) {
      schema.name = uniqueTypeName(`Prime_Slice_${upperFirst(camelCase(schema.name))}`);
    } else {
      schema.name = uniqueTypeName(upperFirst(camelCase(schema.name)));
    }

    schema.fields = await documentTransformer.getFields(schema);

    const { name, fields } = schema;
    const payload = { schema, schemas, fields, name, resolvers, types, documentTransformer };
    const SchemaTypeConfig = await createSchemaType(payload);
    types.set(name, SchemaTypeConfig);
  }

  for (const schema of schemas) {
    const { asyncResolve } = types.get(schema.name) || { asyncResolve: null };
    if (asyncResolve) {
      await asyncResolve();
    }
  }

  for (const schema of schemas) {
    if (!types.has(schema.name) || schema.variant !== SchemaVariant.Default) {
      continue;
    }

    const SchemaTypeConfig = types.get(schema.name);

    const SchemaType = SchemaTypeConfig.type;
    const { CREATE, UPDATE } = PrimeFieldOperation;

    if (!SchemaType || Object.keys(omit(SchemaType.getFields(), ['id', '_meta'])).length === 0) {
      continue;
    }

    const { name, fields } = schema;
    const payload = { schema, schemas, fields, name, resolvers, types, documentTransformer };

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
  }

  const primeDocumentNotFoundTypeName = uniqueTypeName('Prime_Document_NotFound');
  const PrimeDocumentNotFound = new GraphQLObjectType({
    name: primeDocumentNotFoundTypeName,
    fields: { message: { type: GraphQLString } },
  });
  types.set(primeDocumentNotFoundTypeName, { type: PrimeDocumentNotFound });

  const primeDocumentTypeName = uniqueTypeName('Prime_Document');
  queries[primeDocumentTypeName] = {
    args: {
      id: { type: GraphQLString },
      locale: { type: GraphQLString },
    },
    type: new GraphQLUnionType({
      name: primeDocumentTypeName,
      types: Array.from(types.values()).map(typeConfig => typeConfig.type),
    }),
  };

  resolvers[primeDocumentTypeName] = documentUnionResolver(resolvers);

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

  // Extract type field resolvers
  const typeFieldResolvers = Array.from(types.entries()).reduce((acc, [key, value]) => {
    if (value && value.type) {
      const fields = value.type.getFields();
      const typeResolvers = Object.entries(fields).reduce((acc2, [key2, value2]: any) => {
        if (value2 && value2.resolve) {
          acc2[key2] = value2.resolve;
        }
        return acc2;
      }, {});
      if (Object.keys(typeResolvers).length) {
        acc[key] = typeResolvers;
      }
    }
    return acc;
  }, {});

  return new GraphQLModule({
    name: 'prime-external',
    typeDefs,
    resolvers: {
      Query: {
        [primeDocumentTypeName]: queries[primeDocumentTypeName],
        ...pick(resolvers, Object.keys(queries)),
      },
      ...typeFieldResolvers,
      ...(hasMutations && { Mutation: pick(resolvers, Object.keys(mutations)) }),
      [primeDocumentTypeName]: {
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
