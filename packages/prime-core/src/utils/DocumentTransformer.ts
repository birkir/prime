import DataLoader from 'dataloader';
import { defaultsDeep, get } from 'lodash';
import { Service } from 'typedi';
import { getRepository, In } from 'typeorm';
import { Document } from '../entities/Document';
import { Schema } from '../entities/Schema';
import { SchemaField } from '../entities/SchemaField';

const Types = {
  ROOT: 0,
  GROUP: 1,
  SLICE: 2,
  INPUT: 10,
  OUTPUT: 11,
};

@Service()
export class DocumentTransformer {
  public fieldsDataloader = new DataLoader(async keys => {
    const result = await getRepository(SchemaField).find({
      where: {
        schemaId: In(keys),
      },
      cache: 1000,
    });
    return keys.map(key => result.filter(n => n.schemaId === key));
  });

  public getFields = async (schema: Schema): Promise<SchemaField[]> => {
    const schemaIds: string[] = [schema.id];

    if (schema) {
      schemaIds.push(...get(schema, 'settings.schemaIds', []));
    }

    return (await this.fieldsDataloader.loadMany(schemaIds)).flat();
  };

  public transform = async (
    fields: SchemaField[],
    data: any,
    schema: Schema,
    io = Types.INPUT,
    type = Types.ROOT
  ) => {
    const output: { [key: string]: any } = {};

    if (type === Types.SLICE) {
      if (!data.__inputname) {
        return {};
      }
      output.__inputname = data.__inputname;
    }

    for (const field of fields) {
      if (!field) {
        continue;
      }

      const { primeField } = field;

      let value = get(data, io === Types.INPUT ? field.name : field.id);

      if (primeField) {
        if (io === Types.INPUT) {
          value = await primeField.processInput(value);
        } else if (io === Types.OUTPUT) {
          value = await primeField.processOutput(value);
        }
      }

      if (typeof value === 'undefined') {
        continue;
      }

      if (field.parentFieldId && type !== Types.GROUP) {
        continue;
      }

      const defaultOptions = primeField ? primeField.options : {};
      const options = defaultsDeep(field.options || {}, defaultOptions);

      if (field.type === 'group') {
        const subFields = fields.filter(f => f.parentFieldId === field.id);
        if (options.repeated && Array.isArray(value)) {
          value = (await Promise.all(
            value.map(item => this.transform(subFields, item, schema, io, Types.GROUP))
          )).filter(item => Object.keys(item).length > 0);
        } else {
          value = await this.transform(subFields, value, schema, io, Types.GROUP);
          if (Object.keys(value).length === 0) {
            continue;
          }
        }
      }

      if (field.type === 'slice') {
        if (options.multiple && Array.isArray(value)) {
          value = value.sort((a: any, b: any): number => {
            return a.__index - b.__index;
          });
          value = (await Promise.all(
            value.map(async item => {
              const sfields = await this.getFields({ id: item.__inputname } as any);
              if (sfields) {
                return await this.transform(sfields, item, schema, io, Types.SLICE);
              }
              return {};
            })
          )).filter(item => Object.keys(item as object).length > 0);
        } else {
          const sfields = await this.getFields({ id: value.__inputname } as any);
          value = await this.transform(sfields, value, schema, io, Types.SLICE);
          if (Object.keys(value).length === 0) {
            continue;
          }
        }
      }

      if (io === Types.INPUT) {
        output[field.id] = value;
      } else if (io === Types.OUTPUT) {
        output[field.name] = value;
      }
    }

    return output;
  };

  public transformInput = async (data: any, schema: Schema, fields?: SchemaField[]) => {
    if (!fields) {
      fields = await this.getFields(schema);
    }
    return this.transform(fields, data, schema, Types.INPUT);
  };

  public transformOutput = async (document: Document, schema?: Schema, fields?: SchemaField[]) => {
    if (!schema) {
      schema = await getRepository(Schema).findOneOrFail(document.schemaId, {
        cache: 1000,
      });
    }

    if (!fields) {
      fields = await this.getFields(schema);
    }

    return this.transform(fields, document.data, schema, Types.OUTPUT);
  };
}
