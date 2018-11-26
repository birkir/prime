import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLUnionType } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import * as GraphQLUnionInputType from 'graphql-union-input-type';

const unknownSliceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'UnknownSlice',
  fields: {
    error: { type: GraphQLString },
    raw: { type: GraphQLJSON }
  }
});

export class PrimeFieldSlice extends PrimeField {

  public id: string = 'slice';
  public title: string = 'Slice';
  public description: string = 'Slice field';

  public defaultOptions: {} = {};

  /**
   * GraphQL type for output query
   */
  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {

    const { field, queries, contentType, contentTypes, resolveFieldType } = args;

    if (!contentType || !field.options || !field.options.contentTypeIds) {
      return null;
    }

    const contentTypeIds = (field.options.contentTypeIds || []);
    const pascalName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    const sliceTypes = contentTypeIds.map((sliceId: string) => {

      const sliceType = contentTypes
        .find((contentTypeItem) => contentTypeItem.id === sliceId);

      if (!sliceType) {
        return null;
      }

      const fieldsTypes = sliceType.fields.reduce(
        (acc, nfield: any) => { // tslint:disable-line no-any
          const fieldType = resolveFieldType(nfield, true);
          if (fieldType) {
            acc[nfield.name] = fieldType.getGraphQLOutput({
              field: nfield,
              queries,
              contentTypes,
              resolveFieldType
            });
          }

          if (!acc[nfield.name]) {
            delete acc[nfield.name];
          }

          return acc;
        },
        {}
      );

      const pascalType: string = sliceType.name.charAt(0).toUpperCase() + sliceType.name.slice(1);

      return {
        id: sliceId,
        name: `${contentType.name}${pascalName}${pascalType}`,
        fields: fieldsTypes
      };
    });

    if (sliceTypes.filter((n) => !!n).length === 0) {
      return null;
    }

    const types: GraphQLObjectType[] = sliceTypes.map((type) => {
      if (!type) {
        return null;
      }

      return new GraphQLObjectType({
        name: type.name,
        fields: type.fields
      });
    });

    return {
      type: new GraphQLList(
        new GraphQLUnionType({
          name: `${contentType.name}${pascalName}Slice`,
          types: [...types, unknownSliceType],
          resolveType(value, context, info): GraphQLObjectType {
            if (value.__inputname) {
              const sliceTypeIndex = sliceTypes.findIndex((s: { id: string }) => s.id === value.__inputname);
              if (sliceTypeIndex >= 0) {
                return types[sliceTypeIndex];
              }
            }

            return unknownSliceType;
          }
        })
      )
    };
  }

  /**
   * GraphQL type for input mutation
   */
  public getGraphQLInput({ field, queries, contentTypes, contentType, resolveFieldType, isUpdate }) {

    if (!contentType || !field.options || !field.options.contentTypeIds) {
      return null;
    }

    const pascalName: string = `${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
    const actionName = isUpdate ? 'Update' : 'Create';

    const sliceTypes = (field.options.contentTypeIds || []).map((sliceId) => {
      const sliceType = contentTypes.find((n: { id: string}) => n.id === sliceId);
      if (!sliceType) {
        return null;
      }

      const fieldsTypes = (sliceType.fields || []).reduce(
        (acc, nfield: any) => { // tslint:disable-line no-any
          const fieldType = resolveFieldType(nfield, true);
          if (fieldType) {
            acc[nfield.name] = fieldType.getGraphQLInput({
              field: nfield,
              queries,
              contentTypes,
              resolveFieldType
            });
          }

          if (!acc[nfield.name]) {
            delete acc[nfield.name];
          }

          return acc;
        },
        {}
      );

      return {
        id: sliceId,
        name: `${contentType.name}${pascalName}${sliceType.name}`,
        fields: fieldsTypes,
        type: new GraphQLInputObjectType({
          name: `${contentType.name}${pascalName}${sliceType.name}`,
          fields: {
            __inputname: { type: GraphQLString },
            ...fieldsTypes
          }
        })
      };
    });

    if (sliceTypes.filter((n) => !!n).length === 0) {
      return null;
    }

    const sliceFieldType = GraphQLUnionInputType({
      name: `${contentType.name}${pascalName}${actionName}Input`,
      inputTypes: sliceTypes.map((s) => s.type),
      typeKey: '__inputname'
    });

    return {
      type: new GraphQLList(
        new GraphQLNonNull(sliceFieldType)
      )
    };
  }

  public getGraphQLWhere() {
    return null;
  }
}
