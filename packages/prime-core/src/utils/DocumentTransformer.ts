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
  public getFields = async (schema: Schema): Promise<SchemaField[]> => {
    const schemaIds: string[] = [schema.id];

    if (schema) {
      schemaIds.push(...get(schema, 'settings.schemaIds', []));
    }

    const fields = await getRepository(SchemaField).find({
      where: {
        schemaId: In(schemaIds),
      },
      cache: 1000,
    });

    return fields;
  };

  public transform = async (
    fields: SchemaField[],
    data: any,
    schema: Schema,
    io = Types.INPUT,
    type = Types.ROOT
  ) => {
    const output = {};

    if (type === Types.SLICE) {
      if (!data.__inputname) {
        return {};
      }
      (output as any).__inputname = data.__inputname;
    }

    for (const field of fields) {
      if (!field) {
        continue;
      }
      let value = get(data, io === Types.INPUT ? field.name : field.id);

      if (typeof value === 'undefined') {
        continue;
      }

      // @todo add field resolvers

      // if (field.field) {
      //   if (io === Types.INPUT && field.field.processInput) {
      //     value = await field.field.processInput(value, field);
      //   } else if (io === Types.OUTPUT && field.field.processOutput) {
      //     value = await field.field.processOutput(value, field);
      //   }
      // }

      if (field.parentFieldId && type !== Types.GROUP) {
        continue;
      }

      // const defaultOptions = (field.field && field.field.defaultOptions) || {};
      const defaultOptions = {};
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
          value = (await Promise.all(
            value.map(async item => {
              const sfields = await this.getFields(item.__inputname);
              if (sfields) {
                return await this.transform(sfields, item, schema, io, Types.SLICE);
              }
              return {};
            })
          )).filter(item => Object.keys(item).length > 0);
        } else {
          const sfields = await this.getFields(value.__inputname);
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

  public transformInput = async (document: Document, schema?: Schema, fields?: SchemaField[]) => {
    if (!schema) {
      schema = await getRepository(Schema).findOneOrFail(document.schemaId, { cache: 1000 });
    }
    if (!fields) {
      fields = await this.getFields(schema);
    }
    return this.transform(fields, document.data, schema, Types.INPUT);
  };

  public transformOutput = async (document: Document, schema?: Schema, fields?: SchemaField[]) => {
    if (!schema) {
      schema = await getRepository(Schema).findOneOrFail(document.schemaId, { cache: 1000 });
    }
    if (!fields) {
      fields = await this.getFields(schema);
    }
    return this.transform(fields, document.data, schema, Types.OUTPUT);
  };
}
