import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { get } from 'lodash';

interface IOptions {
  items: string[];
  required: boolean;
  enum: boolean;
  multiple: boolean;
}

export class PrimeFieldSelect extends PrimeField {

  public id: string = 'select';
  public title: string = 'Select';
  public description: string = 'Select field';

  public defaultOptions: IOptions = {
    items: [],
    required: false,
    enum: false,
    multiple: false
  };

  private types = new Map();

  public getEnumType = ({ contentType, field }, items) => {
    const key = [contentType.name, field.name, JSON.stringify(field.options)].join(',');

    if (this.types.has(key)) {
      return this.types.get(key);
    }

    const values = items.reduce(
      (acc, item) => {
        if (item && item.key && item.key !== '' && item.value) {
          if (item.key.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)) {
            acc[item.key] = { value: item.value };
          }
        }

        return acc;
      },
      {}
    );

    if (Object.keys(values).length === 0) {
      return null;
    }

    this.types.set(key, new GraphQLEnumType({
      name: `${contentType.name}_${field.apiName}`,
      values
    }));

    return this.types.get(key);
  }

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { items, enum: enumeration, multiple } = this.getOptions(args.field);
    const outputType = enumeration ? this.getEnumType(args, items) : GraphQLString;

    if (!outputType) {
      return null;
    }

    return {
      type: multiple ? new GraphQLList(outputType) : outputType,
      resolve: (root, rArgs, context, info) => {
        const values = items.reduce(
          (acc, item) => {
            if (item && item.key && item.key !== '' && item.value) {
              if (item.key.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)) {
                acc[item.key] = item.value;
              }
            }

            return acc;
          },
          {}
        );

        const value = get(values, root[info.fieldName], null);

        if (!value && !enumeration) {
          return root[info.fieldName];
        }

        return value;
      }
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { items, multiple, required } = this.getOptions(args.field);
    const enumType = this.getEnumType(args, items);
    const inputType = required ? new GraphQLNonNull(enumType) : enumType;

    if (!inputType) {
      return null;
    }

    return {
      type: multiple ? new GraphQLList(inputType) : inputType
    };
  }

  public getGraphQLWhere(args: IPrimeFieldGraphQLArguments) {
    const { items, multiple } = this.getOptions(args.field);
    const enumType = this.getEnumType(args, items);

    if (!enumType) {
      return null;
    }

    if (!multiple) {
      return {
        type: new GraphQLInputObjectType({
          name: `PrimeFieldSelectWhere${args.contentType.name}_${args.field.apiName}`,
          fields: {
            eq: { type: enumType }
          }
        })
      };
    }

    return null;
  }
}
