import { GraphQLID } from 'graphql';

// import { bufferContentEntry } from '../../utils/bufferContentEntry';

export class ETDocument {

  static input() {
    return {
      type: GraphQLID,
    };
  }

  static output(field, fields, contentTypes) {
    return {
      type: fields[field.options.contentType].type,
      async resolve(root, args, context, info) {
        const contentType = contentTypes.find(t => t.name === field.options.contentType);

        if (!root[field.name]) {
          return null
        }

        return await fields[contentType.name].resolve(root, { id: root[field.name] }, context, info);

        // const entry = await bufferContentEntry(contentType.id, root[field.name], sequelizeDataLoader);

        // if (entry) {
        //   return {
        //     entryId: entry.entryId,
        //     ...entry.data
        //   };
        // }

        // return null;
      }
    };
  }
}
