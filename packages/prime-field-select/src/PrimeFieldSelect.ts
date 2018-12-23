import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';
import { get } from 'lodash';

interface IOptions {
  items: string[];
  enum: boolean;
  multiple: boolean;
}

export class PrimeFieldSelect extends PrimeField {

  public id: string = 'select';
  public title: string = 'Select';
  public description: string = 'Select field';

  public defaultOptions: IOptions = {
    items: [],
    enum: false,
    multiple: false
  };

  private key;
  private enumType;
  private values;

  public getEnumType = ({ contentType, field }, items) => {
    const key = JSON.stringify(items);

    if (this.key === key) {
      return this.enumType;
    }

    this.key = key;

    this.values = items.reduce(
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

    if (Object.keys(this.values).length === 0) {
      return null;
    }

    this.enumType = new GraphQLEnumType({
      name: `${contentType.name}_${field.apiName}`,
      values: this.values
    });

    return this.enumType;
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
        const value = get(this.values, [root[info.fieldName], 'value'].join('.'), null);

        if (!value && !enumeration) {
          return root[info.fieldName];
        }

        return value;
      }
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { items, multiple } = this.getOptions(args.field);
    const enumType = this.getEnumType(args, items);

    if (!enumType) {
      return null;
    }

    return {
      type: multiple ? new GraphQLList(enumType) : enumType
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
