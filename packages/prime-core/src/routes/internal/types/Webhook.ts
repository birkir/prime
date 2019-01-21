import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { attributeFields } from 'graphql-sequelize';

export const Webhook = new GraphQLObjectType({
  name: 'Webhook',
  fields: () => ({
    ...attributeFields(Webhook),
    success: { type: GraphQLInt },
    count: { type: GraphQLInt },
  }),
});
