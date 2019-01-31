import { GraphQLInputObjectType, GraphQLString } from 'graphql';
import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from './PrimeField';

// Allocate statically
export const PrimeFieldStringWhere = new GraphQLInputObjectType({
  name: 'PrimeField_String_Where',
  fields: {
    neq: { type: GraphQLString },
    eq: { type: GraphQLString },
    contains: { type: GraphQLString },
  },
});

export class PrimeFieldString extends PrimeField {
  public async outputType(context: PrimeFieldContext) {
    return {
      type: GraphQLString,
    };
  }

  public async inputType(context: PrimeFieldContext, operation: PrimeFieldOperation) {
    if (operation === PrimeFieldOperation.CREATE) {
      return { type: GraphQLString };
    } else if (operation === PrimeFieldOperation.UPDATE) {
      return { type: GraphQLString };
    }
    return null;
  }

  public async whereType() {
    return PrimeFieldStringWhere;
  }
}
