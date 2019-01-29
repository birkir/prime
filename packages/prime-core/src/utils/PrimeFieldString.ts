import { GraphQLString } from 'graphql';
import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from './PrimeField';

export class PrimeFieldString extends PrimeField {
  public async outputType(context: PrimeFieldContext) {
    return {
      type: GraphQLString,
    };
  }

  public async inputType(context: PrimeFieldContext, operation: PrimeFieldOperation) {
    if (operation === PrimeFieldOperation.CREATE) {
      // this
    } else if (operation === PrimeFieldOperation.UPDATE) {
      // that
    }

    return null;
  }
}
