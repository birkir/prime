import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { attributeFields } from 'graphql-sequelize';
import { Webhook as WebhookModel } from '../../../models/Webhook';

export const Webhook = new GraphQLObjectType({
  name: 'Webhook',
  fields: () => ({
    ...attributeFields(WebhookModel),
    success: { type: GraphQLInt },
    count: { type: GraphQLInt },
  }),
});
