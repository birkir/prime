import { GraphQLID } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ensurePermitted } from './utils/ensurePermitted';

export const remove = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLID,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'delete');

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
