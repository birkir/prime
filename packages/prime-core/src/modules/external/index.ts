import { GraphQLModule } from '@graphql-modules/core';
import { PrimeFieldOperation } from '@primecms/field';
import debug from 'debug';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLUnionType } from 'graphql';
import { camelCase, omit, upperFirst } from 'lodash';
import { createResolversMap } from 'type-graphql/dist/utils/createResolversMap';
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
      // maybe do something special?
      schema.name = uniqueTypeName(upperFirst(camelCase(schema.name)));
    } else {
      schema.name = uniqueTypeName(upperFirst(camelCase(schema.name)));
    }

    schema.fields = await documentTransformer.getFields(schema);

    const { name, fields } = schema;
    const payload = { schema, schemas, fields, name, resolvers, types, documentTransformer };
    const SchemaTypeConfig = await createSchemaType(payload);
    types.set(name, SchemaTypeConfig);

    const { CREATE, UPDATE } = PrimeFieldOperation;
    const SchemaType = SchemaTypeConfig.type;

    const connectionType = await createSchemaConnectionType(payload, SchemaType);
    const createType = await createSchemaInputType(payload, SchemaType, CREATE);
    const updateType = await createSchemaInputType(payload, SchemaType, UPDATE);

    if (schema.variant === SchemaVariant.Default) {
      queries[name] = SchemaTypeConfig;
      queries[`all${name}`] = connectionType;
      mutations[`create${name}`] = createType;
      mutations[`update${name}`] = updateType;
      mutations[`remove${name}`] = DocumentRemove;
    }

    types.set(`create${name}`, createType);
    types.set(`update${name}`, updateType);
  }

  for (const [, type] of types) {
    const { asyncResolve } = type || { asyncResolve: null };
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
    queries[name].resolve = resolvers[name];
    queries[`all${name}`].resolve = resolvers[`all${name}`];
    mutations[`create${name}`].resolve = resolvers[`create${name}`];
    mutations[`update${name}`].resolve = resolvers[`update${name}`];
    mutations[`remove${name}`].resolve = resolvers[`remove${name}`];
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
      types: [
        ...Array.from(types.values())
          .filter(
            ({ variant, operation }) =>
              variant === SchemaVariant.Default && operation === PrimeFieldOperation.READ
          )
          .map(typeConfig => typeConfig.type),
        PrimeDocumentNotFound,
      ],
    }),
    resolve: documentUnionResolver(resolvers),
  };

  const hasMutations = Object.keys(mutations).length;

  const graphqlSchema = new GraphQLSchema({
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
  });

  const resolverMap = createResolversMap(graphqlSchema);
  const unionResolvers = Object.entries(resolverMap).reduce((acc, item) => {
    const [key, value] = item as any;
    if (key && value.__resolveType) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return new GraphQLModule({
    name: 'prime-external',
    extraSchemas: [graphqlSchema],
    resolvers: unionResolvers,
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
