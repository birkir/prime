import { PrimeField } from '@primecms/field';
import { GraphQLBoolean } from 'graphql';

interface Options {
  label: string;
}

export class PrimeFieldBoolean extends PrimeField {
  public static type: string = 'boolean';
  public static title: string = 'Boolean';
  public static description: string = 'Boolean field';
  public static options: Options = {
    label: '',
  };

  public outputType() {
    return {
      type: GraphQLBoolean,
    };
  }

  public inputType() {
    return {
      type: GraphQLBoolean,
    };
  }

  public whereType() {
    return GraphQLBoolean;
  }

  public async processInput(value) {
    return Boolean(value);
  }

  public async processOutput(value) {
    return Boolean(value);
  }
}
