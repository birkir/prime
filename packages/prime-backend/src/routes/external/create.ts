import { GraphQLInputObjectType, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';
import { ensurePermitted } from './utils/ensurePermitted';

export const create = (GraphQLContentType, contentType, queries) => {
  return {
    type: GraphQLContentType,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: `Create${contentType.name}`,
          fields: {
            language: { type: GraphQLString },
            ...contentType.fields.reduce((acc, field: ContentTypeField) => {
              const FieldType = resolveFieldType(field);
              if (FieldType && FieldType.input) {
                acc[field.name] = FieldType.input();
              }
              return acc;
            }, {}),
          },
        }),
      },
    },
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'create');

      const { language = 'en', ...data } = args.input;

      const entry = await ContentEntry.create({
        entryId: await ContentEntry.getRandomId(),
        contentTypeId: contentType.id,
        isPublished: true,
        language,
        data,
      });

      if (entry && queries[contentType.name]) {
        return await queries[contentType.name].resolve(root, { id: entry.entryId, language }, context, info);
      }

      return null;
    },
  };
};
