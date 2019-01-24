import { GraphQLObjectType } from 'graphql';
import { attributeFields } from 'graphql-sequelize';
import { omit } from 'lodash';
import { WebhookCall as WebhookCallModel } from '../../../models/WebhookCall';

export const WebhookCall = new GraphQLObjectType({
  name: 'WebhookCall',
  fields: () => omit(attributeFields(WebhookCallModel), ['webhookId']),
});
