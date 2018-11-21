import { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';

import { ContentTypeField } from '../../models/ContentTypeField';

type IField = {
  id?: string;
  type: string;
  name: string;
  title: string;
  group: string;
  fields?: IField[];
  options?: any;
};

type IGroup = {
  title: string;
  fields?: IField[];
  body?: any;
};

export const ContentTypeType = new GraphQLObjectType({
  name: 'ContentTypeFieldType',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    group: { type: GraphQLString },
    options: { type: GraphQLJSON },
    fields: { type: new GraphQLList(ContentTypeType) },
  }),
});

export const ContentTypeFieldGroup = new GraphQLObjectType({
  name: 'ContentTypeFieldGroupType',
  fields: {
    title: { type: GraphQLID },
    fields: { type: new GraphQLList(ContentTypeType) },
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
    fields: { type: new GraphQLList(ContentTypeInputType) },
  }),
});

export const ContentTypeFieldGroupInputType = new GraphQLInputObjectType({
  name: 'ContentTypeFieldGroupInputType',
  fields: {
    title: { type: GraphQLID },
    fields: { type: new GraphQLList(ContentTypeInputType) },
  }
});

// Get fields for a specific content type
export const getFields = async (contentTypeId: string) => {

  // Get all fields for content type
  const fields = await ContentTypeField.findAll({
    where: {
      contentTypeId,
    },
    order: [
      ['position', 'ASC'],
    ],
  });

  const groups = fields.reduce((acc: any[], field, index: number) => {
    if (field.contentTypeFieldId) {
      return acc;
    }

    if (!field.group || field.group === '') {
      field.group = 'Main';
    }

    let group: any = acc.find((g: any) => g && g.title === field.group);

    if (!group) {
      group = { title: field.group, fields: [] };
      acc.push(group);
    }

    group.fields.push({
      ...field.dataValues,
      position: field.dataValues.position || index,
    });

    return acc;
  }, []);

  fields.forEach((field) => {
    if (field.contentTypeFieldId) {
      const parentField = fields.find(f => f.id === field.contentTypeFieldId);
      if (parentField) {
        const group = groups.find(g => g.title === parentField.group);
        if (group) {
          const target = group.fields.find(f => f.id === parentField.id);
          target.fields = target.fields || [];
          target.fields.push({
            ...field.dataValues,
            position: field.dataValues.position || target.fields.length,
          });
        }
      }
    }
  });

  return groups;
}

export const setFields = async (contentTypeId, groups: IGroup[]) => {
  const originalFields = await ContentTypeField.findAll({
    where: {
      contentTypeId,
    },
  });

  const removeFieldIds = new Set(originalFields.map(f => f.id));

  const updateOrCreateField = async (field: IField, position: number, parent?: IField) => {
    const obj = {
      contentTypeId,
      position,
      type: field.type,
      name: field.name,
      group: field.group,
      title: field.title,
      options: field.options,
    } as any;

    if (parent) {
      obj.contentTypeFieldId = parent.id;
    }

    let ctField;

    if (field.id) {
      removeFieldIds.delete(field.id);

      ctField = await ContentTypeField.findByPrimary(field.id);
    }

    if (ctField) {
      await ctField.update(obj);
    } else {
      ctField = await ContentTypeField.create(obj);
    }

    return ctField;
  }

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];

    if (group.fields) {
      for (let f = 0; f < group.fields.length; f++) {
        const field = await updateOrCreateField(group.fields[f], f);
        const subfields = group.fields[f].fields;

        if (field && subfields) {
          for (let ff = 0; ff < subfields.length; ff++) {
            await updateOrCreateField(subfields[ff], ff, field);
          }
        }
      }
    }
  }

  // Remove old fields
  await ContentTypeField.destroy({
    where: {
      id: Array.from(removeFieldIds),
    },
  });

};
