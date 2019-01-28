import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import { isNumber, mapValues, omitBy } from 'lodash';
import { Connection } from 'typeorm';
import { buildTypeDefsAndResolvers } from '../../utils/build-resolvers/buildTypeDefsAndResolvers';
import { DocumentResolver } from './resolvers/DocumentResolver';
import { PrimeResolver } from './resolvers/PrimeResolver';
import { ReleaseResolver } from './resolvers/ReleaseResolver';
import { SchemaResolver } from './resolvers/SchemaResolver';
import { WebhookResolver } from './resolvers/WebhookResolver';
import { authChecker } from './utils/authChecker';

export const pubSub = new PubSub();

const noEnumsOrInheritedModels = (item: any, key: string) => {
  if (key === 'User') {
    return true;
  }
  if (typeof item === 'object' && Object.values(item).every(isNumber)) {
    return true;
  }
  return false;
};

const noUndefinedTypeOf = (item, key) => {
  if (typeof item.__isTypeOf === 'undefined') {
    delete item.__isTypeOf;
  }
  return item;
};

export const createInternal = async (connection: Connection) => {
  const schema = await buildTypeDefsAndResolvers({
    resolvers: [PrimeResolver, WebhookResolver, ReleaseResolver, SchemaResolver, DocumentResolver],
    pubSub,
    authChecker,
  });

  return new GraphQLModule({
    name: 'prime-internal',
    typeDefs: () => [schema.typeDefs],
    resolvers: () =>
      mapValues(omitBy(schema.resolvers, noEnumsOrInheritedModels), noUndefinedTypeOf),
    configRequired: false,
  });
};
