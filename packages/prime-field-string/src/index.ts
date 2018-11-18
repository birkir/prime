import { GraphQLString } from 'graphql';
import { PrimeFieldStringWhere } from './PrimeFieldStringWhere';
import PrimeField from '@primecms/field';

interface FieldOptions {
  singleline: boolean;
}

/**
 * Pure text field
 */
export default class PrimeFieldString extends PrimeField {

  id = 'string';
  title = 'String';
  description = 'Text field with no formatting';

  /**
   * Default options for field
   */
  defaultOptions: FieldOptions = {
    singleline: true,
  };

  /**
   * GraphQL type for output query
   */
  GraphQL() {
    return {
      type: GraphQLString,
    };
  }

  /**
   * GraphQL type for input mutation
   */
  GraphQLInput() {
    return {
      type: GraphQLString,
    }
  }

  /**
   * GraphQL type for where query
   */
  GraphQLWhere() {
    return {
      type: PrimeFieldStringWhere,
    };
  }
}
