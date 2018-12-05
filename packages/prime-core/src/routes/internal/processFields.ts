import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import { fields as allFields } from '../../fields';

import { ContentTypeField } from '../../models/ContentTypeField';

type IField = {
  id?: string;
  type: string;
  name: string;
  title: string;
  group: string;
  fields?: IField[];
  position?: number;
  options?: any; // tslint:disable-line no-any
};

type IGroup = {
  title: string;
  fields?: IField[];
};

// tslint:disable variable-name
export const ContentTypeType = new GraphQLObjectType({
  name: 'ContentTypeFieldType',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    group: { type: GraphQLString },
    options: { type: GraphQLJSON },
    fields: { type: new GraphQLList(ContentTypeType) }
  })
});

export const ContentTypeFieldGroup = new GraphQLObjectType({
  name: 'ContentTypeFieldGroupType',
  fields: {
    title: { type: GraphQLID },
    fields: { type: new GraphQLList(ContentTypeType) }
  }
});

export const ContentTypeInputType = new GraphQLInputObjectType({
  name: 'ContentTypeFieldInputType',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    group: { type: GraphQLString },
    options: { type: GraphQLJSON },
    fields: { type: new GraphQLList(ContentTypeInputType) }
  })
});

export const ContentTypeFieldGroupInputType = new GraphQLInputObjectType({
  name: 'ContentTypeFieldGroupInputType',
  fields: {
    title: { type: GraphQLID },
    fields: { type: new GraphQLList(ContentTypeInputType) }
  }
});

// Get fields for a specific content type
export const getFields = async (contentTypeId: string) => {

  // Get all fields for content type
  const fields = await ContentTypeField.findAll({
    where: {
      contentTypeId
    },
    order: [
      ['position', 'ASC']
    ]
  });

  const groups = fields.reduce(
    (acc: IGroup[], field, index: number) => {
      if (field.contentTypeFieldId) {
        return acc;
      }

      if (!field.group || field.group === '') {
        field.group = 'Main';
      }

      let group: IGroup | undefined = acc.find((g: IGroup) => g && g.title === field.group);

      if (!group) {
        group = { title: field.group, fields: [] };
        acc.push(group);
      }

      if (group.fields) {
        group.fields.push({
          ...field.dataValues as any, // tslint:disable-line prefer-type-cast no-any
          position: field.dataValues.position || index
        });
      }

      return acc;
    },
    []
  );

  fields.forEach((field) => {
    if (field.contentTypeFieldId) {
      const parentField = fields.find(f => f.id === field.contentTypeFieldId);
      if (parentField) {
        const group = groups.find(g => g.title === parentField.group);
        if (group && group.fields) {
          const target = group.fields.find(f => f.id === parentField.id);
          if (target) {
            target.fields = target.fields || [];
            target.fields.push({
              ...field.dataValues as any, // tslint:disable-line prefer-type-cast no-any
              position: field.dataValues.position || target.fields.length
            });
          }
        }
      }
    }
  });

  return groups;
};

export const setFields = async (contentTypeId, groups: IGroup[]) => {
  const originalFields = await ContentTypeField.findAll({
    where: {
      contentTypeId
    }
  });

  const removeFieldIds = new Set(originalFields.map(f => f.id));

  const updateOrCreateField = async (field: IField, group: string, position: number, parent?: IField) => {

    const fieldInstance = allFields.find(f => f.id === field.type);
    const defaultOptions = (fieldInstance && fieldInstance.defaultOptions) || {};

    const obj: any = { // tslint:disable-line no-any
      contentTypeId,
      position,
      type: field.type,
      name: field.name,
      group: group,
      title: field.title,
      options: {
        ...defaultOptions,
        ...field.options
      },
    };

    if (parent) {
      obj.contentTypeFieldId = parent.id;
    }

    let ctField;

    if (field.id) {
      removeFieldIds.delete(field.id);

      ctField = await ContentTypeField.findOne({
        where: {
          id: field.id
        }
      });
    }

    if (ctField) {
      await ctField.update(obj);
    } else {
      ctField = await ContentTypeField.create(obj);
    }

    return ctField;
  };

  for (const group of groups) {
    if (group.fields) {
      for (let f = 0; f < group.fields.length; f += 1) {
        const field = await updateOrCreateField(group.fields[f], group.title, f);
        const subfields = group.fields[f].fields;

        if (field && subfields) {
          for (let ff = 0; ff < subfields.length; ff = + 1) {
            await updateOrCreateField(subfields[ff], group.title, ff, field);
          }
        }
      }
    }
  }

  // Remove old fields
  await ContentTypeField.destroy({
    where: {
      id: Array.from(removeFieldIds)
    }
  });

};
