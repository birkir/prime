import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

export const WebhookInput = new GraphQLNonNull(
  new GraphQLInputObjectType({
    name: 'WebhookInput',
    fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      url: { type: new GraphQLNonNull(GraphQLString) },
      method: { type: new GraphQLNonNull(GraphQLString) },
    },
  })
);
