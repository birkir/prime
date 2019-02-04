import { GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

export const DocumentRemove = {
  args: {
    id: { type: new GraphQLNonNull(GraphQLID), description: 'Accepts hashid or UUID' },
    locale: { type: GraphQLString, description: 'Optional when using UUID as id' },
  },
  type: GraphQLBoolean,
};
