import { GraphQLObjectType } from 'graphql';
import { attributeFields } from 'graphql-sequelize';
import { omit } from 'lodash';

export const WebhookCall = new GraphQLObjectType({
  name: 'WebhookCall',
  fields: () => omit(attributeFields(WebhookCall), ['webhookId']),
});
