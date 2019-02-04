import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const PrimeFieldStringWhere = new GraphQLInputObjectType({
  name: 'PrimeField_String_Where',
  fields: {
    neq: { type: GraphQLString },
    eq: { type: GraphQLString },
    contains: { type: GraphQLString },
  },
});
