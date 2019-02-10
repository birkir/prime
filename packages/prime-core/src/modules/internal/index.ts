import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { mapValues, omitBy } from 'lodash';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import Container from 'typedi';
import { Connection } from 'typeorm';
import { pubSub } from '../../utils/pubSub';
import { createAccounts } from '../accounts';
import { AccessTokenResolver } from './resolvers/AccessTokenResolver';
import { DocumentResolver } from './resolvers/DocumentResolver';
import { PrimeResolver } from './resolvers/PrimeResolver';
import { ReleaseResolver } from './resolvers/ReleaseResolver';
import { SchemaResolver } from './resolvers/SchemaResolver';
import { UserResolver } from './resolvers/UserResolver';
import { WebhookResolver } from './resolvers/WebhookResolver';
import { abilityForbiddenMiddleware } from './utils/abilityErrorMiddleware';
import { createAbility } from './utils/createAbility';
import { isAuthenticated } from './utils/isAuthenticated';
import { noEnumsOrInheritedModels } from './utils/noEnumsOrInheritedModels';
import { noUndefinedTypeOf } from './utils/noUndefinedTypeOf';

export const log = debug('prime:core');

export const createInternal = async (connection: Connection) => {
  log('building schema');

  const accounts = await createAccounts(connection);

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
    globalMiddlewares: [abilityForbiddenMiddleware],
    container: ({ context }) => context.container,
  });

  return new GraphQLModule({
    name: 'prime-core',
    imports: [accounts],
    typeDefs: () => [schema.typeDefs],
    resolvers: () =>
      mapValues(omitBy(schema.resolvers, noEnumsOrInheritedModels), noUndefinedTypeOf),
    async context(session, currentContext) {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const container = Container.of(requestId);

      const ctx = {
        requestId,
        container,
        ability: createAbility(currentContext),
      };

      container.set('context', ctx);
      return ctx;
    },
    resolversComposition: {
      'Mutation.createUser': [isAuthenticated()],
    },
    configRequired: false,
    logger: {
      clientError: () => null,
      log,
      error: log,
    },
  });
};
