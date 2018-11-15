import { GraphQLID, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { includeLanguages } from './utils/includeLanguages';

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

      if (entry) {
        return {
          id: entry.entryId,
          _meta: {
            language: entry.language,
            languages: [].concat((entry as any).languages),
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
          },
          ...entry.data
        };
      }

      return null;
    },
  };
};
