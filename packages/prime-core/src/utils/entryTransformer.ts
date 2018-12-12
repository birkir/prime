import { get, defaultsDeep } from 'lodash';
import { ContentTypeField } from '../models/ContentTypeField';

const Types = {
  ROOT: 0,
  GROUP: 1,
  SLICE: 2,
  INPUT: 10,
  OUTPUT: 11,
};

export class EntryTransformer {

  cache = new Map();

  getFields = async (id) => {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const fields = await ContentTypeField.findAll({
      where: {
        contentTypeId: id,
      }
    });

    this.cache.set(id, fields);

    return fields;
  }

  transform = async (fields, data, io = Types.INPUT, type = Types.ROOT) => {
    const output = {};

    if (type === Types.SLICE) {
      if (!data.__inputname) return {};
      (output as any).__inputname = data.__inputname;
    }

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];

      let value = get(data, io === Types.INPUT ? field.name : field.id);

      if (typeof value === 'undefined') {
        continue;
      }

      if (field.field) {
        if (io === Types.INPUT && field.field.processInput) {
          value = await field.field.processInput(value);
        } else if (io === Types.OUTPUT && field.field.processOutput) {
          value = await field.field.processOutput(value);
        }
      }

      if (field.contentTypeFieldId && type !== Types.GROUP) {
        continue;
      }

      const defaultOptions = (field.field && field.field.defaultOptions) || {};
      const options = defaultsDeep(field.options || {}, defaultOptions);

      // Process group fields
      if (field.type === 'group') {
        const subFields = fields.filter(f => f.contentTypeFieldId === field.id);
        if (options.repeated && Array.isArray(value)) {
          value = (await Promise.all(value.map(item => this.transform(subFields, item, io, Types.GROUP))))
            .filter(item => Object.keys(item).length > 0);
        } else {
          value = await this.transform(subFields, value, io, Types.GROUP);
        }
      }

      // Process slices
      if (field.type === 'slice') {
        if (options.multiple && Array.isArray(value)) {
          value = (await Promise.all(value.map(async item => {
            const fields = await this.getFields(item.__inputname);
            if (fields) {
              return await this.transform(fields, item, io, Types.SLICE);
            }
            return {};
          })))
            .filter(item => Object.keys(item).length > 0);
        }
      }

      if (io === Types.INPUT) {
        output[field.id] = value;
      } else if (io === Types.OUTPUT) {
        output[field.name] = value;
      }
    }

    return output;
  }

  resetTransformCache = () => this.cache.clear();

  transformInput = async (data, contentTypeId) => {
    const fields = await this.getFields(contentTypeId);
    return this.transform(fields, data, Types.INPUT);
  }

  transformOutput = async (data, contentTypeId) => {
    const fields = await this.getFields(contentTypeId);
    return this.transform(fields, data, Types.OUTPUT);
  }
}
