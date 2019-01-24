import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import GraphQLUnionInputType from 'graphql-union-input-type';

const unknownSliceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'UnknownSlice',
  fields: {
    error: { type: GraphQLString },
    raw: { type: GraphQLJSON },
  },
});

interface IOptions {
  multiple: boolean;
  contentTypeIds: string[];
}

export class PrimeFieldSlice extends PrimeField {
  public id: string = 'slice';
  public title: string = 'Slice';
  public description: string = 'Slice field';

  public defaultOptions: IOptions = {
    multiple: true,
    contentTypeIds: [],
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { field, queries, contentType, contentTypes } = args;

    const options = this.getOptions(field);

    if (!contentType || !options.contentTypeIds) {
      return null;
    }

    const contentTypeIds = options.contentTypeIds || [];
    const sliceTypes = contentTypeIds.map((sliceId: string) => {
      const sliceType = contentTypes.find(contentTypeItem => contentTypeItem.id === sliceId);

      if (sliceType && queries.__slices[sliceType.name]) {
        return {
          id: sliceId,
          type: queries.__slices[sliceType.name].outputType,
        };
      }

      return null;
    });

    if (sliceTypes.filter(n => !!n).length === 0) {
      return null;
    }

    const types = sliceTypes.map(({ type }) => type);

    const union = new GraphQLUnionType({
      name: `${contentType.name}_${field.apiName}`,
      types: [...types, unknownSliceType],
      resolveType(value, context, info): GraphQLObjectType {
        if (value.__inputname) {
          const sliceTypeIndex = sliceTypes.findIndex((s: { id: string }) => s.id === value.__inputname);
          if (sliceTypeIndex >= 0) {
            return types[sliceTypeIndex];
          }
        }

        return unknownSliceType;
      },
    });

    if (options.multiple) {
      return {
        type: new GraphQLList(union),
      };
    }

    return { type: union };
  }

  /**
   * GraphQL type for input mutation
   */
  public getGraphQLInput({ field, queries, contentTypes, contentType, resolveFieldType, isUpdate }) {
    const options = this.getOptions(field);

    if (!contentType || !options.contentTypeIds) {
      return null;
    }

    const actionName = isUpdate ? 'Update' : 'Create';

    const sliceTypes = (options.contentTypeIds || []).map(sliceId => {
      const sliceType = contentTypes.find((n: { id: string }) => n.id === sliceId);
      if (!sliceType) {
        return null;
      }

      const fieldsTypes = (sliceType.fields || []).reduce((acc, nfield: any) => {
        const fieldType = resolveFieldType(nfield, true);
        if (fieldType) {
          acc[nfield.name] = fieldType.getGraphQLInput({
            field: nfield,
            queries,
            contentTypes,
            resolveFieldType,
          });
        }

        if (!acc[nfield.name]) {
          delete acc[nfield.name];
        }

        return acc;
      }, {});

      return {
        id: sliceId,
        name: `${contentType.name}_${field.apiName}_${sliceType.name}`,
        fields: fieldsTypes,
        type: new GraphQLInputObjectType({
          name: `${contentType.name}_${field.apiName}_${sliceType.name}`,
          fields: {
            __inputname: { type: GraphQLString },
            ...fieldsTypes,
          },
        }),
      };
    });

    if (sliceTypes.filter(n => !!n).length === 0) {
      return null;
    }

    const sliceFieldType = GraphQLUnionInputType({
      name: `${contentType.name}_${field.apiName}${actionName}Input`,
      inputTypes: sliceTypes.map(s => s.type),
      typeKey: '__inputname',
    });

    if (options.multiple) {
      return {
        type: new GraphQLList(new GraphQLNonNull(sliceFieldType)),
      };
    }

    return { type: sliceFieldType };
  }

  public getGraphQLWhere() {
    return null;
  }
}
