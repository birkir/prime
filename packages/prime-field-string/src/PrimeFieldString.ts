import { PrimeField, PrimeFieldContext, PrimeFieldOperation } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import { GraphQLString } from 'graphql';
import { PrimeFieldStringWhere } from './PrimeFieldStringWhere';

interface Options {
  type: 'singleline' | 'multiline' | 'markdown';
  md?: string[];
  appearance?: string;
  rules: {
    required?: boolean;
    urlsafe?: boolean;
    min?: boolean;
    minValue?: number;
    max?: boolean;
    maxValue?: number;
  };
}

export class PrimeFieldString extends PrimeField {
  public static type = 'string';
  public static title = 'String';
  public static description = 'Text field with no formatting';
  public static defaultOptions: Options = {
    type: 'singleline',
    rules: {},
  };

  public async outputType(context: PrimeFieldContext) {
    return {
      type: GraphQLString,
      description: this.schemaField.description,
    };
  }

  public async inputType(context: PrimeFieldContext, operation: PrimeFieldOperation) {
    return { type: GraphQLString };
  }

  public async whereType(context: PrimeFieldContext) {
    return PrimeFieldStringWhere;
  }

  public async processInput(value) {
    const { rules } = this.options;
    const { name } = this.schemaField;

    if (rules.required) {
      if (value === '' || value === undefined || value === null) {
        throw new ValidationError(`Field '${name}' is required`);
      }
    }

    if (rules.urlsafe) {
      if (!value.match(/^[A-Za-z][A-Za-z0-9_-]*$/)) {
        throw new ValidationError(`Field '${name}' must be url-safe (/^[A-Za-z][A-Za-z0-9_-]*$/)`);
      }
    }

    if (rules.min && rules.minValue) {
      const min = Number(rules.minValue);
      if (value.length < min) {
        throw new ValidationError(
          `Field '${name}' must be ${min} character${min === 1 ? '' : 's'} or more`
        );
      }
    }

    if (rules.max && rules.maxValue) {
      const max = Number(rules.maxValue);
      if (value.length > max) {
        throw new ValidationError(
          `Field '${name}' must be ${max} character${max === 1 ? '' : 's'} or less`
        );
      }
    }

    return value;
  }
}
