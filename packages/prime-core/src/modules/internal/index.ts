import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import debug from 'debug';
import { mapValues, omitBy } from 'lodash';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { Connection } from 'typeorm';
import { AccessTokenResolver } from './resolvers/AccessTokenResolver';
import { DocumentResolver } from './resolvers/DocumentResolver';
import { PrimeResolver } from './resolvers/PrimeResolver';
import { ReleaseResolver } from './resolvers/ReleaseResolver';
import { SchemaResolver } from './resolvers/SchemaResolver';
import { UserResolver } from './resolvers/UserResolver';
import { WebhookResolver } from './resolvers/WebhookResolver';
import { authChecker } from './utils/authChecker';
import { noEnumsOrInheritedModels } from './utils/noEnumsOrInheritedModels';
import { noUndefinedTypeOf } from './utils/noUndefinedTypeOf';

export const log = debug('prime:core');

export const pubSub = new PubSub();

const defaultCheckAuth = (context?: any): Promise<boolean> => Promise.resolve(true);

export const createInternal = async (connection: Connection, checkAuth = defaultCheckAuth) => {
  log('building schema');

  const schema = await buildTypeDefsAndResolvers({
    resolvers: [
      AccessTokenResolver,
      DocumentResolver,
      PrimeResolver,
      ReleaseResolver,
      SchemaResolver,
      UserResolver,
      WebhookResolver,
    ],
    pubSub,
    authChecker,
    container: ({ context }) => context.container,
  });

  return new GraphQLModule({
    name: 'prime-internal',
    typeDefs: () => [schema.typeDefs],
    resolvers: () =>
      mapValues(omitBy(schema.resolvers, noEnumsOrInheritedModels), noUndefinedTypeOf),
    configRequired: false,
    logger: {
      clientError: log,
      log,
      error: log,
    },
  });
};
