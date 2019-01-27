import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import { isNumber, omitBy } from 'lodash';
import { Connection } from 'typeorm';
import { buildTypeDefsAndResolvers } from '../../utils/build-resolvers/buildTypeDefsAndResolvers';
import { WebhookResolver } from './resolvers/WebhookResolver';
export const pubSub = new PubSub();

export const createInternal = async (connection: Connection) => {
  const schema = await buildTypeDefsAndResolvers({
    resolvers: [WebhookResolver],
    pubSub,
  });

  return new GraphQLModule({
    name: 'Prime.Internal',
    typeDefs: () => [schema.typeDefs],
    resolvers: ({ config = {} }) =>
      omitBy(schema.resolvers, (item: any, key: string) => {
        if (key === 'User') {
          return true;
        }
        if (typeof item === 'object' && Object.values(item).every(isNumber)) {
          return true;
        }
        return false;
      }),
    configRequired: false,
  });
};
