import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export class ETString {

  static WhereOp = new GraphQLInputObjectType({
    name: 'ETStringWhereOp',
    fields: {
      neq: { type: GraphQLString },
      eq: { type: GraphQLString },
    }
  });

  static output() {
    return {
      type: GraphQLString,
    };
  }

  static input() {
    return {
      type: GraphQLString,
    }
  }

  static where() {
    return {
      type: ETString.WhereOp,
    };
  }
}
