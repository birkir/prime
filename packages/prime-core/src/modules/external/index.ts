import { AccountsModule } from '@accounts/graphql-api';
import AccountsServer from '@accounts/server';
import { GraphQLModule } from '@graphql-modules/core';
import { PrimeFieldOperation } from '@primecms/field';
import { AuthenticationError } from 'apollo-server-core';
import debug from 'debug';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLUnionType } from 'graphql';
import { camelCase, omit, upperFirst } from 'lodash';
import { createResolversMap } from 'type-graphql/dist/utils/createResolversMap';
import Container from 'typedi';
import { Connection, getRepository } from 'typeorm';
import { Document } from '../../entities/Document';
import { Schema, SchemaVariant } from '../../entities/Schema';
import { DocumentTransformer } from '../../utils/DocumentTransformer';
import { createAllDocumentResolver } from './resolvers/createAllDocumentResolver';
import { createDocumentCreateResolver } from './resolvers/createDocumentCreateResolver';
import { createDocumentRemoveResolver } from './resolvers/createDocumentRemoveResolver';
import { createDocumentResolver } from './resolvers/createDocumentResolver';
import { createDocumentUpdateResolver } from './resolvers/createDocumentUpdateResolver';
import { documentUnionResolver } from './resolvers/documentUnionResolver';
import { createSchemaConnectionArgs } from './types/createSchemaConnectionArgs';
import { createSchemaConnectionType } from './types/createSchemaConnectionType';
import { createSchemaInputType } from './types/createSchemaInputType';
import { createSchemaType } from './types/createSchemaType';
import { DocumentRemove } from './types/DocumentRemove';
import { resetTypeNames, uniqueTypeName } from './utils/uniqueTypeNames';

export const log = debug('prime:graphql');

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

    const { CREATE, UPDATE } = PrimeFieldOperation;
    const SchemaType = SchemaTypeConfig.type;

    types.set(name, SchemaTypeConfig);

    const args = await createSchemaConnectionArgs(payload);
    const connectionType = await createSchemaConnectionType(payload, SchemaType);
    const createType = await createSchemaInputType(payload, SchemaType, CREATE);
    const updateType = await createSchemaInputType(payload, SchemaType, UPDATE);

    if (schema.variant === SchemaVariant.Default) {
      queries[name] = SchemaTypeConfig;

      if (!schema.settings.single) {
        queries[`all${name}`] = {
          args,
          type: connectionType,
        };
      }

      if (schema.settings.mutations) {
        mutations[`create${name}`] = createType;
        mutations[`update${name}`] = updateType;
        mutations[`remove${name}`] = DocumentRemove;
      }
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

    const { name, fields } = schema;
    const payload = { schema, schemas, fields, name, resolvers, types, documentTransformer };

    resolvers[name] = await createDocumentResolver(payload);
    resolvers[`all${name}`] = await createAllDocumentResolver(payload);
    resolvers[`create${name}`] = await createDocumentCreateResolver(payload);
    resolvers[`update${name}`] = await createDocumentUpdateResolver(payload);
    resolvers[`remove${name}`] = await createDocumentRemoveResolver(payload);

    queries[name].resolve = resolvers[name];

    if (queries[`all${name}`]) {
      queries[`all${name}`].resolve = resolvers[`all${name}`];
    }

    if (mutations[`create${name}`]) {
      mutations[`create${name}`].resolve = resolvers[`create${name}`];
    }

    if (mutations[`update${name}`]) {
      mutations[`update${name}`].resolve = resolvers[`update${name}`];
    }

    if (mutations[`remove${name}`]) {
      mutations[`remove${name}`].resolve = resolvers[`remove${name}`];
    }

    const SchemaType = types.get(schema.name)!.type!;

    if (!SchemaType || Object.keys(omit(SchemaType.getFields(), ['id', '_meta'])).length === 0) {
      delete queries[name];
      delete queries[`all${name}`];
      delete mutations[`create${name}`];
      delete mutations[`update${name}`];
      delete mutations[`remove${name}`];
      types.delete(name);
    }
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

  const PRIME_TOKEN = 'x-prime-token';
  const PRIME_PREVIEW = 'x-prime-preview';

  return new GraphQLModule({
    name: 'prime-graphql',
    extraSchemas: [graphqlSchema],
    resolvers: unionResolvers,
    async context({ req }) {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      log('requestId', requestId);
      const container = Container.of(requestId);
      const ctx: { [key: string]: any } = {
        requestId,
        container,
      };

      if (req.headers[PRIME_TOKEN]) {
        const server = AccountsModule.injector.get(AccountsServer);
        ctx.userSession = await server.findSessionByAccessToken(req.headers[PRIME_TOKEN]);
        if (!ctx.userSession) {
          throw new AuthenticationError('Token not valid');
        }

        if (req.headers[PRIME_PREVIEW]) {
          ctx.preview = await getRepository(Document).findOneOrFail(req.headers[PRIME_PREVIEW]);
        }
      }

      container.set('context', ctx);
      return ctx;
    },
    // logger: {
    //   clientError: () => null,
    //   log,
    //   error: log,
    // },
  });
};
