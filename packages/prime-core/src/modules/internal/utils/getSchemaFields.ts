import { defaultsDeep, get } from 'lodash';
import { getRepository, In } from 'typeorm';
import { Schema, SchemaVariant } from '../../../entities/Schema';
import { SchemaField } from '../../../entities/SchemaField';
import { fields as allFields } from '../../../utils/fields';

export const getSchemaFields = async (schemaId: string, inheritance = true) => {
  const schemaRepo = getRepository(Schema);
  const schemaFieldRepo = getRepository(SchemaField);
  const schemaIds = [schemaId];
  const schema = await schemaRepo.findOne(schemaId);

  if (schema && inheritance) {
    schemaIds.push(...get(schema, 'settings.schemaIds', []));
  }

  const fieldsSource = await schemaFieldRepo.find({
    where: {
      schemaId: In(schemaIds),
    },
    order: { position: 'ASC' },
  });

  const fields = [
    ...fieldsSource.filter(f => f.schemaId === schemaId),
    ...fieldsSource.filter(f => f.schemaId !== schemaId),
  ];

  const defaultGroup = schema && schema.variant === SchemaVariant.Template ? schema.title : 'Main';
  const groups = ((schema && schema.groups) || [defaultGroup]).map(title => ({
    title,
    fields: [],
  }));

  const withOptions = field => {
    const fieldInstance = allFields.find(f => f.type === field.type);
    const defaultOptions = (fieldInstance && fieldInstance.defaultOptions) || {};
    field.options = defaultsDeep(field.options || {}, defaultOptions);
    return field;
  };

  fields.reduce((acc, field, index: number) => {
    if (field.parentFieldId) {
      return acc;
    }

    if (!field.group || field.group === '') {
      field.group = defaultGroup;
    }

    let group = groups.find(g => g && g.title === field.group);

    if (!group) {
      group = { title: field.group, fields: [] };
      groups.push(group);
    }

    if (group.fields) {
      group.fields.push(
        withOptions({
          ...field,
          position: field.position || index,
        })
      );
    }

    return acc;
  }, []);

  fields.forEach(field => {
    if (field.parentFieldId) {
      const parentField = fields.find(f => f.id === field.parentFieldId);
      if (parentField) {
        const group = groups.find(g => g.title === parentField.group);
        if (group && group.fields) {
          const target = group.fields.find(f => f.id === parentField.id);
          if (target) {
            target.fields = target.fields || [];
            target.fields.push(
              withOptions({
                ...field,
                position: field.position || target.fields.length,
              })
            );
          }
        }
      }
    }
  });

  return groups;
};
