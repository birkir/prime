import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
import { ContentTypeField } from '../../../models/ContentTypeField';
import { resolveFieldType } from './resolveFieldType';

export class ETGroup {

  static input(field, fields, contentType, actionName = 'Create') {
    if (!contentType || !contentType.fields) {
      return null;
    }
    const pascalName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    const subFields = contentType.fields.filter(f => f.contentTypeFieldId === field.id);
    const fieldsTypes = subFields.reduce((acc, nfield: ContentTypeField) => {
      const FieldType = resolveFieldType(nfield, true);
      if (FieldType && FieldType.output) {
        acc[nfield.name] = FieldType.input(nfield, fields, contentType);
      }
      if (!acc[nfield.name]) {
        delete acc[nfield.name];
      }
      return acc;
    }, {});

    if (fieldsTypes.length === 0) {
      return null;
    }

    const GroupFieldType = new GraphQLInputObjectType({
      name: `${contentType.name}${pascalName}${actionName}Input`,
      fields: () => ({
        ...fieldsTypes,
      }),
    });

    return { type: new GraphQLList(new GraphQLNonNull(GroupFieldType)) };
  }

  static output(field, fields, contentTypes) {
    const contentType = contentTypes.find(c => c.id === field.contentTypeId);
    if (contentType) {
      const subFields = contentType.fields.filter(f => f.contentTypeFieldId === field.id);
      const pascalName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
      const fieldsTypes = subFields.reduce((acc, nfield: ContentTypeField) => {
        const FieldType = resolveFieldType(nfield, true);
        if (FieldType && FieldType.output) {
          acc[nfield.name] = FieldType.output(nfield, fields, contentTypes);
        }
        if (!acc[nfield.name]) {
          delete acc[nfield.name];
        }
        return acc;
      }, {});

      if (fieldsTypes.length === 0) {
        return null;
      }

      const GroupFieldType = new GraphQLObjectType({
        name: `${contentType.name}${pascalName}`,
        fields: () => ({
          ...fieldsTypes,
        }),
      });

      return { type: new GraphQLList(GroupFieldType) };
    }

    return null;
  }

}
