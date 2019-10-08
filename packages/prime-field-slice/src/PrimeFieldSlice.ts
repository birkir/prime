import { PrimeField, PrimeFieldContext, PrimeFieldOperation, SchemaVariant } from '@primecms/field';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import GraphQLUnionInputType from 'graphql-union-input-type';
import { upperFirst } from 'lodash';

const UnknownSliceType = new GraphQLObjectType({
  name: 'Prime_UnknownSlice',
  fields: {
    error: { type: GraphQLString },
    raw: { type: GraphQLJSON },
  },
});

interface Options {
  multiple: boolean;
  schemaIds: string[];
}

export class PrimeFieldSlice extends PrimeField {
  public static type: string = 'slice';
  public static title: string = 'Slice';
  public static description: string = 'Slice field';
  public static defaultOptions: Options = {
    multiple: true,
    schemaIds: [],
  };

  public outputType(context: PrimeFieldContext) {
    const { types, schema, schemas } = context;

    if (!schema || !this.options.schemaIds) {
      return null;
    }

    const schemaIds = this.options.schemaIds || [];
    const sliceTypes = schemaIds.map((schemaId: string) => {
      const sliceType = schemas.find(s => s.id === schemaId && s.variant === SchemaVariant.Slice);
      if (sliceType && types.has(sliceType.name)) {
        return {
          id: schemaId,
          type: types.get(sliceType.name)!.type,
        };
      }

      return null;
    });

    if (sliceTypes.filter(n => !!n).length === 0) {
      return null;
    }

    const resolveType = value => {
      if (value.__inputname) {
        const index = sliceTypes.findIndex(s => s.id === value.__inputname);
        if (index >= 0) {
          return sliceTypes[index].type;
        }
      }
      return UnknownSliceType;
    };

    const SlicesUnionType = new GraphQLUnionType({
      name: context.uniqueTypeName(`${schema.name}_${this.schemaField.name}`),
      types: [...sliceTypes.map(s => s.type), UnknownSliceType],
      resolveType,
    });

    return {
      type: new GraphQLList(SlicesUnionType),
    };
  }

  public inputType(
    context: PrimeFieldContext,
    operation: PrimeFieldOperation.CREATE | PrimeFieldOperation.UPDATE
  ) {
    const options = this.options;

    if (!context.schema || !options.schemaIds) {
      return null;
    }

    const actionName = operation === PrimeFieldOperation.UPDATE ? 'update' : 'create';

    const schemaIds = this.options.schemaIds || [];
    const sliceTypes = schemaIds.map((schemaId: string) => {
      const sliceType = context.schemas.find(
        s => s.id === schemaId && s.variant === SchemaVariant.Slice
      );
      if (sliceType) {
        const typeName = `${actionName}${sliceType.name}`;
        if (sliceType && context.types.has(typeName)) {
          const type = context.types.get(typeName)!.args!.input.type as any;
          return {
            id: schemaId,
            name: sliceType.name,
            type: type.ofType,
          };
        }
      }

      return null;
    });

    if (sliceTypes.filter(n => !!n).length === 0) {
      return null;
    }

    const sliceFieldType = GraphQLUnionInputType({
      name: `${context.schema.name}_${this.schemaField.name}${upperFirst(actionName)}Input`,
      inputTypes: sliceTypes.map(s => s.type),
      typeKey: '___inputname',
      resolveType(name) {
        const sliceType = sliceTypes.find(n => n.name === name);
        if (sliceType) {
          return sliceType.type;
        }
      },
    });

    if (options.multiple) {
      return {
        type: new GraphQLList(new GraphQLNonNull(sliceFieldType)),
      };
    }

    return { type: sliceFieldType };
  }

  public whereType() {
    return null;
  }
}
