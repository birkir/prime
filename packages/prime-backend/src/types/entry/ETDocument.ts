import { GraphQLID } from 'graphql';

import { bufferContentEntry } from '../../utils/bufferContentEntry';

export class ETDocument {

  static input() {
    return {
      type: GraphQLID,
    };
  }

  static output(field, fields, contentTypes) {
    return {
      type: fields[field.options.contentType].type,
      async resolve(root,  args, context, info) {
        const { sequelizeDataLoader } = context;
        const ct = contentTypes.find(t => t.name === field.options.contentType);
        const entry = await bufferContentEntry(ct!.id, root[field.name], sequelizeDataLoader);

        if (entry) {
          return {
            id: entry.id,
            ...entry.data
          };
        }

        return null;
      }
    };
  }
}
