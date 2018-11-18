import { GraphQLID, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ensurePermitted } from './utils/ensurePermitted';

export const remove = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLBoolean,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
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
        return true;
      }

      return false;
    },
  };
};
