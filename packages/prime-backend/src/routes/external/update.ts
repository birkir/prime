import { GraphQLInputObjectType, GraphQLID, GraphQLString } from 'graphql';

import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';

export const update = (GraphQLContentType, contentType, queries) => {
  return {
    type: GraphQLContentType,
    args: {
      id: { type: GraphQLID },
      language: { type: GraphQLString },
      input: {
        type: new GraphQLInputObjectType({
          name: `Update${contentType.name}`,
          fields: {
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
      const { input, language, id } = args;

      // TODO: What version should he get back?
      // TODO: Draft/Published control

      const entry = await ContentEntry.find({
        where: {
          contentTypeId: contentType.id,
          entryId: id,
        },
      });

      if (entry) {
        const draft = await entry.draft(input, language);
        const publishedEntry = await draft.publish();

        if (publishedEntry && queries[contentType.name]) {
          return await queries[contentType.name].resolve(root, { id, language }, context, info);
        }
      }

      return null;
    },
  };
};
