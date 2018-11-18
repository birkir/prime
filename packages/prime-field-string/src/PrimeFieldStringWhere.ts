import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const PrimeFieldStringWhere = new GraphQLInputObjectType({
  name: 'PrimeFieldStringWhereOp',
  fields: {
    neq: { type: GraphQLString },
    eq: { type: GraphQLString },
  }
});
