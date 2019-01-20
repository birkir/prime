import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const primeFieldStringWhere = new GraphQLInputObjectType({
  name: 'PrimeFieldStringWhereOp',
  fields: {
    neq: { type: GraphQLString },
    eq: { type: GraphQLString },
  },
});
