import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import { GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull } from 'graphql';

interface IOptions {
  float: boolean;
  rules?: {
    required?: boolean;
    min?: boolean;
    minValue?: number;
    max?: boolean;
    maxValue?: number;
  };
}

export class PrimeFieldNumber extends PrimeField {

  public id: string = 'number';
  public title: string = 'Number';
  public description: string = 'Number field';

  public defaultOptions: IOptions = {
    float: true,
    rules: {}
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { float } = this.getOptions(args.field);

    return {
      type: float ? GraphQLFloat : GraphQLInt,
      description: args.field.description
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { float, rules } = this.getOptions(args.field);
    const type = float ? GraphQLFloat : GraphQLInt;

    return {
      type: rules.required ? new GraphQLNonNull(type) : type,
      description: args.field.description
    };
  }

  public getGraphQLWhere(args: IPrimeFieldGraphQLArguments) {
    const { float } = this.getOptions(args.field);
    const type = float ? GraphQLFloat : GraphQLInt;

    return {
      type: new GraphQLInputObjectType({
        name: `PrimeFieldNumberWhere${float ? 'Float' : ''}`,
        fields: {
          neq: { type },
          eq: { type },
          gt: { type },
          lt: { type },
          gte: { type },
          lte: { type }
        }
      })
    };
  }

  public processInput(value, field) {
    const { rules } = this.getOptions(field);

    if (rules.required) {
      if (value === '' || value === undefined || value === null) {
        throw new ValidationError(`Field '${field.name}' is required`);
      }
    }

    if (rules.min && rules.minValue) {
      const min = Number(rules.minValue);
      if (value.length <= min) {
        throw new ValidationError(`Field '${field.name}' must be greater or equal to ${min}`);
      }
    }

    if (rules.max && rules.maxValue) {
      const max = Number(rules.maxValue);
      if (value.length >= max) {
        throw new ValidationError(`Field '${field.name}' must be less or equal to ${max}`);
      }
    }

    return value;
  }
}
