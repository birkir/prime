import { GraphQLInputObjectType, GraphQLFloat } from 'graphql';

export class ETNumber {

  static WhereOp = new GraphQLInputObjectType({
    name: 'ETNumberWhereOp',
    fields: {
      neq: { type: GraphQLFloat },
      eq: { type: GraphQLFloat },
      gt: { type: GraphQLFloat },
      gte: { type: GraphQLFloat },
      lt: { type: GraphQLFloat },
      lte: { type: GraphQLFloat },
    }
  });

  static output() {
    return {
      type: GraphQLFloat,
    };
  }

  static input() {
    return {
      type: GraphQLFloat,
    };
  }

  static where() {
    return {
      type: ETNumber.WhereOp,
    };
  }
}
