import { getRepository, In } from 'typeorm';
import { Schema } from '../../../entities/Schema';
import { SchemaField } from '../../../entities/SchemaField';

export const setSchemaFields = async (schemaId: string, groups) => {
  const schemaRepo = getRepository(Schema);
  const schemaFieldRepo = getRepository(SchemaField);

  const originalFields = await schemaFieldRepo.find({
    where: {
      schemaId,
    },
  });

  const removeFieldIds = new Set(originalFields.map(f => f.id));

  const updateOrCreateField = async (
    field: SchemaField,
    group: string,
    position: number,
    parent?: any
  ) => {
    if (field.schemaId !== schemaId) {
      return null;
    }

    const obj: any = {
      schemaId,
      position,
      type: field.type,
      name: field.name,
      description: field.description,
      group,
      title: field.title,
      primary: field.primary || false,
      options: field.options,
    };

    if (parent) {
      obj.parentFieldId = parent.id;
    }

    let ctField;

    if (field.id) {
      removeFieldIds.delete(field.id);
      ctField = await schemaFieldRepo.findOne(field.id);
    }

    if (ctField) {
      await ctField.update(obj);
    } else {
      ctField = await schemaFieldRepo.create(obj);
      await schemaFieldRepo.save(ctField);
    }

    return ctField;
  };

  for (const group of groups) {
    if (group.fields) {
      for (let f = 0; f < group.fields.length; f += 1) {
        const field = await updateOrCreateField(group.fields[f], group.title, f);
        const subfields = group.fields[f].fields;

        if (field && subfields) {
          for (let ff = 0; ff < subfields.length; ff += 1) {
            await updateOrCreateField(subfields[ff], group.title, ff, field);
          }
        }
      }
    }
  }

  await schemaFieldRepo.delete({
    id: In(Array.from(removeFieldIds)),
  });

  const schema = await schemaRepo.findOne({
    where: {
      id: schemaId,
    },
  });

  if (schema) {
    schema.groups = groups.map(group => group.title);
    await schemaRepo.save(schema);
  }

  return true;
};
