import { PrimeField } from '@primecms/field';
import { GraphQLString } from 'graphql';
import { primeFieldStringWhere } from './primeFieldStringWhere';

interface IPrimeFieldStringOptions {
  type: 'singleline' | 'multiline' | 'markdown';
  md?: string[];
  appearance?: string;
  rules?: {
    required?: boolean;
  };
}

export class PrimeFieldString extends PrimeField {

  public id: string = 'string';
  public title: string = 'String';
  public description: string = 'Text field with no formatting';

  public defaultOptions: IPrimeFieldStringOptions = {
    type: 'singleline'
  };

  public getGraphQLOutput() {
    return {
      type: GraphQLString
    };
  }

  public getGraphQLInput() {
    return {
      type: GraphQLString
    };
  }

  public getGraphQLWhere() {
    return {
      type: primeFieldStringWhere
    };
  }
}
