import { GraphQLString, GraphQLObjectType, GraphQLUnionType, GraphQLList, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import PrimeField from '@primecms/field';
import * as GraphQLUnionInputType from 'graphql-union-input-type';
import * as GraphQLJSON from 'graphql-type-json';

interface FieldOptions {}

const UnknownSlice = new GraphQLObjectType({
  name: 'UnknownSlice',
  fields: {
    error: { type: GraphQLString },
    raw: { type: GraphQLJSON }
  },
});

/**
 * Pure text field
 */
export default class PrimeFieldSlice extends PrimeField {

  id = 'slice';
  title = 'Slice';
  description = 'Slice field';

  /**
   * Default options for field
   */
  defaultOptions: FieldOptions = {};

  /**
   * GraphQL type for output query
   */
  GraphQL({ field, queries, contentType, contentTypes, resolveFieldType }) {
    if (!contentType || !field.options || !field.options.contentTypeIds) {
      return null;
    }

    const pascalName = field.name.charAt(0).toUpperCase() + field.name.slice(1);

    const sliceTypes = (field.options.contentTypeIds || []).map(sliceId => {
      const sliceType = contentTypes.find(n => n.id === sliceId);
      if (!sliceType) return null;
      const fieldsTypes = sliceType.fields.reduce((acc, nfield: any) => {
        const FieldType = resolveFieldType(nfield, true);

        if (FieldType && FieldType.GraphQL) {
          acc[nfield.name] = FieldType.GraphQL({
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

      const pascalType = sliceType.name.charAt(0).toUpperCase() + sliceType.name.slice(1);

      return {
        id: sliceId,
        name: `${contentType.name}${pascalName}${pascalType}`,
        fields: fieldsTypes,
      };
    });

    if (sliceTypes.filter(n => !!n).length === 0) {
      return null;
    }

    const types = sliceTypes.map(type => {
      return new GraphQLObjectType({
        name: type.name,
        fields: type.fields,
      });
    });

    return {
      type: new GraphQLList(new GraphQLUnionType({
        name: `${contentType.name}${pascalName}Slice`,
        types: [...types, UnknownSlice],
        resolveType(value, context, info) {
          if (value.__inputname) {
            const sliceTypeIndex = sliceTypes.findIndex((s: { id: string }) => s.id === value.__inputname);
            if (sliceTypeIndex >= 0) {
              return types[sliceTypeIndex];
            }
          }
          return UnknownSlice;
        }
      }))
    };
  }

  /**
   * GraphQL type for input mutation
   */
  GraphQLInput({ field, queries, contentTypes, contentType, resolveFieldType, isUpdate }) {

    if (!contentType || !field.options || !field.options.contentTypeIds) {
      return null;
    }

    const pascalName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    const actionName = isUpdate ? 'Update' : 'Create';

    const sliceTypes = (field.options.contentTypeIds || []).map(sliceId => {
      const sliceType = contentTypes.find((n: { id: string}) => n.id === sliceId);
      if (!sliceType) return null;
      const fieldsTypes = (sliceType.fields || []).reduce((acc, nfield: any) => {
        const FieldType = resolveFieldType(nfield, true);

        if (FieldType && FieldType.GraphQLInput) {
          acc[nfield.name] = FieldType.GraphQLInput({
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
        name: `${contentType.name}${pascalName}${sliceType.name}`,
        fields: fieldsTypes,
        type: new GraphQLInputObjectType({
          name: `${contentType.name}${pascalName}${sliceType.name}`,
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

    const SliceFieldType = GraphQLUnionInputType({
      name: `${contentType.name}${pascalName}${actionName}Input`,
      inputTypes: sliceTypes.map(s => s.type),
      typeKey: '__inputname',
    });

    return {
      type: new GraphQLList(
        new GraphQLNonNull(SliceFieldType),
      ),
    };
  }

  /**
   * GraphQL type for where query
   */
  GraphQLWhere() {
    return null;
  }
}
