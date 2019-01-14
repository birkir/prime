import { PrimeField } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import { GraphQLNonNull, GraphQLString } from 'graphql';
import { primeFieldStringWhere } from './PrimeFieldStringWhere';

interface IPrimeFieldStringOptions {
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

  public id: string = 'string';
  public title: string = 'String';
  public description: string = 'Text field with no formatting';

  public defaultOptions: IPrimeFieldStringOptions = {
    type: 'singleline',
    rules: {}
  };

  public getGraphQLOutput({ field }) {
    return {
      type: GraphQLString,
      description: field.description
    };
  }

  public getGraphQLInput({ field }) {
    const { rules } = this.getOptions(field);

    return {
      type: rules.required ? new GraphQLNonNull(GraphQLString) : GraphQLString,
      description: field.description
    };
  }

  public getGraphQLWhere() {
    return {
      type: primeFieldStringWhere
    };
  }

  public processInput(value, field) {
    const { rules } = this.getOptions(field);

    if (rules.required) {
      if (value === '' || value === undefined || value === null) {
        throw new ValidationError(`Field '${field.name}' is required`);
      }
    }

    if (rules.urlsafe) {
      if (!value.match(/^[A-Za-z][A-Za-z0-9_-]*$/)) {
        throw new ValidationError(`Field '${field.name}' must be url-safe (/^[A-Za-z][A-Za-z0-9_-]*$/)`);
      }
    }

    if (rules.min && rules.minValue) {
      const min = Number(rules.minValue);
      if (value.length < min) {
        throw new ValidationError(`Field '${field.name}' must be ${min} character${min === 1 ? '' : 's'} or more`);
      }
    }

    if (rules.max && rules.maxValue) {
      const max = Number(rules.maxValue);
      if (value.length > max) {
        throw new ValidationError(`Field '${field.name}' must be ${max} character${max === 1 ? '' : 's'} or less`);
      }
    }

    return value;
  }
}
