import { getRepository, In } from 'typeorm';
import { Schema } from '../../../entities/Schema';
import { SchemaField } from '../../../entities/SchemaField';

export const setSchemaFields = async (schemaId: string, groups) => {
  const schemaRepo = getRepository(Schema);
  const schemaFieldRepo = getRepository(SchemaField);

  const schemaFields = await schemaFieldRepo.find({
    where: {
      schemaId,
    },
  });

  const fieldsToBeRemovedSet = new Set(schemaFields.map(f => f.id));

  const updateOrCreateField = async (
    data: Partial<SchemaField>,
    group: string,
    position: number,
    parentField?: any
  ) => {
    if (data.schemaId && data.schemaId !== schemaId) {
      return null;
    }

    const field: SchemaField = schemaFieldRepo.create({
      ...data,
      position,
      group,
      schemaId,
    });

    if (parentField) {
      field.parentFieldId = parentField.id;
    }

    if (field.id) {
      fieldsToBeRemovedSet.delete(field.id);
      const source = await schemaFieldRepo.findOneOrFail(field.id);
      await schemaFieldRepo.merge(source, field);
    }
    console.log('saving');
    await schemaFieldRepo.save(field);
    console.log('saved');

    if (data.fields) {
      await Promise.all(
        data.fields.map((children, i) => {
          return updateOrCreateField(children, group, i, field);
        })
      );
    }

    console.log('subfields');

    return field;
  };

  for (const group of groups) {
    if (group.fields) {
      await Promise.all(
        group.fields.map((children, i) => {
          return updateOrCreateField(children, group.title, i);
        })
      );
    }
  }

  if (fieldsToBeRemovedSet.size > 0) {
    await schemaFieldRepo.delete({
      id: In(Array.from(fieldsToBeRemovedSet)),
    });
  }

  const schema = await schemaRepo.findOne(schemaId);

  if (schema) {
    schema.groups = groups.map(group => group.title);
    console.log('save schema');
    await schemaRepo.save(schema);
    console.log('saved schema');
  }

  return true;
};
