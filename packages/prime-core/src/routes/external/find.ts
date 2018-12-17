import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ensurePermitted } from './utils/ensurePermitted';
import { includeLanguages } from './utils/includeLanguages';
import { transformEntry } from './utils/transformEntry';

export const find = ({ GraphQLContentType, contentType, contentTypes, queries }) => {
  return {
    type: GraphQLContentType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      language: { type: GraphQLString }
    },
    async resolve(root, args, context, info) {

      await ensurePermitted(context, contentType, 'read');

      const language = args.language || 'en';
      const published = context.published;

      const where = {
        entryId: args.id,
        contentTypeId: contentType.id,
        language,
      };

      if (published === true) {
        (where as any).isPublished = published;
      }

      const entry = await ContentEntry.findOne({
        attributes: {
          include: [
            [includeLanguages({ published }), 'languages']
          ]
        },
        where,
        order: [
          ['updatedAt', 'DESC']
        ]
      });

      if (!entry) {
        return null;
      }

      context.sequelizeDataLoader.prime(entry);

      return await transformEntry(entry);
    }
  };
};
