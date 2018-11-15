import { GraphQLID, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { includeLanguages } from './utils/includeLanguages';
import { transformEntry } from './utils/transformEntry';

export const find = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLContentType,
    args: {
      id: { type: GraphQLID },
      language: { type: GraphQLString },
    },
    async resolve(root, args, context, info) {
      const language = args.language || 'en';
      const published = true;
      const entry = await ContentEntry.find({
        attributes: {
          include: [
            [includeLanguages(published), 'languages']
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
