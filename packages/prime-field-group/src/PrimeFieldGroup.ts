import { PrimeField } from '@primecms/field';
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

interface IDefaultOptions {
  repeated: boolean;
}

export class PrimeFieldGroup extends PrimeField {

  public id: string = 'group';
  public title: string = 'Group';
  public description: string = 'Group other fields to list';

  public defaultOptions: IDefaultOptions = {
    repeated: true
  };

  public getGraphQLOutput({ field, queries, contentTypes, resolveFieldType }) {
    const contentType = contentTypes.find(c => c.id === field.contentTypeId);
    if (contentType) {
      const subFields = contentType.fields.filter(f => f.contentTypeFieldId === field.id);
      const pascalName = `${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
      const fieldsTypes = subFields.reduce(
        (acc, nfield: any) => {// tslint:disable-line no-any
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

      if (Object.keys(fieldsTypes).length === 0) {
        return null;
      }

      const groupFieldType = new GraphQLObjectType({
        name: `${contentType.name}${pascalName}`,
        fields: () => ({
          ...fieldsTypes
        })
      });

      const options = this.getOptions(field);

      if (options.repeated) {
        return { type: new GraphQLList(groupFieldType) };
      }

      return { type: groupFieldType };
    }

    return null;
  }

  /**
   * GraphQL type for input mutation
   */
  public getGraphQLInput({ field, queries, contentType, isUpdate, resolveFieldType }) {
    if (!contentType || !contentType.fields) {
      return null;
    }
    const pascalName = `${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
    const subFields = contentType.fields.filter(f => f.contentTypeFieldId === field.id);
    const fieldsTypes = subFields.reduce(
      (acc, nfield: any) => { // tslint:disable-line no-any
        const fieldType = resolveFieldType(nfield, true);
        if (fieldType) {
          acc[nfield.name] = fieldType.getGraphQLInput({
            field: nfield,
            queries,
            contentType,
            resolveFieldType,
            isUpdate
          });
        }
        if (!acc[nfield.name]) {
          delete acc[nfield.name];
        }

        return acc;
      },
      {}
    );

    if (fieldsTypes.length === 0) {
      return null;
    }

    const actionName = isUpdate ? 'Update' : 'Create';

    const groupFieldType = new GraphQLInputObjectType({
      name: `${contentType.name}${pascalName}${actionName}Input`,
      fields: fieldsTypes
    });

    const options = this.getOptions(field);

    if (options.repeated) {
      return {
        type: new GraphQLList(
          new GraphQLNonNull(groupFieldType)
        )
      };
    }

    return { type: groupFieldType };
  }

  /**
   * GraphQL type for where query
   */
  public getGraphQLWhere() {
    return null;
  }
}
