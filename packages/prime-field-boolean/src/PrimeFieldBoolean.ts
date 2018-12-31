import { PrimeField } from '@primecms/field';
import { GraphQLBoolean } from 'graphql';

interface IPrimeFieldStringOptions {
  label: string;
}

export class PrimeFieldBoolean extends PrimeField {

  public id: string = 'boolean';
  public title: string = 'Boolean';
  public description: string = 'Boolean field';

  public defaultOptions: IPrimeFieldStringOptions = {
    label: ''
  };

  public getGraphQLOutput() {
    return {
      type: GraphQLBoolean
    };
  }

  public getGraphQLInput() {
    return {
      type: GraphQLBoolean
    };
  }

  public getGraphQLWhere() {
    return {
      type: GraphQLBoolean
    };
  }

  public processInput(value) {
    return Boolean(value);
  }

  public processOutput(value) {
    return Boolean(value);
  }
}
