import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

export const PrimeFieldStringWhere = new GraphQLInputObjectType({
  name: 'PrimeField_String_Where',
  fields: {
    neq: { type: GraphQLString },
    eq: { type: GraphQLString },
    contains: { type: GraphQLString },
    in: { type: new GraphQLList(GraphQLString) },
  },
});
