import { PrimeField, PrimeFieldContext } from '@primecms/field';
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { get, upperFirst } from 'lodash';

interface Options {
  items: string[];
  required: boolean;
  enum: boolean;
  multiple: boolean;
}

export class PrimeFieldSelect extends PrimeField {
  public static type: string = 'select';
  public static title: string = 'Select';
  public static description: string = 'Select field';
  public static options: Options = {
    items: [],
    required: false,
    enum: false,
    multiple: false,
  };

  public EnumType: GraphQLEnumType;

  public ensureEnumType(context) {
    if (!this.EnumType) {
      this.EnumType = new GraphQLEnumType({
        name: `${context.schema.name}_${upperFirst(this.schemaField.name)}`,
        values: this.values,
      });
    }
  }

  get values() {
    return this.options.items.reduce((acc, item) => {
      if (item && item.key && item.key !== '' && item.value) {
        if (item.key.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)) {
          acc[item.key] = { value: item.value };
        }
      }
      return acc;
    }, {});
  }

  public outputType(context: PrimeFieldContext) {
    const { enum: enumeration, multiple } = this.options;
    this.ensureEnumType(context);

    if (this.EnumType.getValues().length === 0) {
      return null;
    }

    const OutputType = enumeration ? this.EnumType : GraphQLString;

    return {
      type: multiple ? new GraphQLList(OutputType) : OutputType,
      resolve: (root, args, ctx, info) => {
        const value = get(this.values, root[info.fieldName], null);

        if (!value && !enumeration) {
          return root[info.fieldName];
        }

        return value.value;
      },
    };
  }

  public inputType(context: PrimeFieldContext) {
    this.ensureEnumType(context);

    if (this.EnumType.getValues().length === 0) {
      return null;
    }

    const InputType = this.options.required ? new GraphQLNonNull(this.EnumType) : this.EnumType;

    return {
      type: this.options.multiple ? new GraphQLList(InputType) : InputType,
    };
  }

  public async whereType(context: PrimeFieldContext) {
    this.ensureEnumType(context);

    if (this.EnumType.getValues().length === 0) {
      return null;
    }

    if (!this.options.multiple) {
      return new GraphQLInputObjectType({
        name: context.uniqueTypeName(
          `${context.schema.name}_${upperFirst(this.schemaField.name)}_Where`
        ),
        fields: {
          eq: { type: this.EnumType },
        },
      });
    }

    return null;
  }
}
