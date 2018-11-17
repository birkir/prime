import { GraphQLID, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { includeLanguages } from './utils/includeLanguages';
import { transformEntry } from './utils/transformEntry';
import { ensurePermitted } from './utils/ensurePermitted';

export const find = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLContentType,
    args: {
      id: { type: GraphQLID },
      language: { type: GraphQLString },
    },
    async resolve(root, args, context, info) {
      
      await ensurePermitted(context, contentType, 'read');

      const language = args.language || 'en';
      // const contentReleaseId = context.contentReleaseId;
      const published = context.published;

      const entry = await ContentEntry.findOne({
        attributes: {
          include: [
            [includeLanguages({ published }), 'languages']
          ],
        },
        where: {
          entryId: args.id,
          contentTypeId: contentType.id,
          language,
        },
        order: [
          ['createdAt', 'DESC'],
        ],
      });

      context.sequelizeDataLoader.prime(entry);

      return transformEntry(entry);
    },
  };
};
