import { GraphQLID } from 'graphql';

import { ContentEntry } from '../../models/ContentEntry';

export const remove = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLID,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(root, args, context, info) {
      const entry = await ContentEntry.find({
        where: {
          contentTypeId: contentType.id,
          id: args.id,
        },
      });

      if (entry) {
        entry.destroy();
        return 1;
      }

      return 0;
    },
  };
};
