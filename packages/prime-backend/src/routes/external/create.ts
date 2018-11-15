import { GraphQLInputObjectType } from 'graphql';

import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';

export const create = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLContentType,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: `Create${contentType.name}`,
          fields: contentType.fields.reduce((acc, field: ContentTypeField) => {
            const FieldType = resolveFieldType(field);
            if (FieldType && FieldType.input) {
              acc[field.name] = FieldType.input();
            }
            return acc;
          }, {}),
        }),
      },
    },
    async resolve(root, args, context, info) {
      const entry = await ContentEntry.create({
        contentTypeId: contentType.id,
        data: args.input,
      });

      if (entry) {
        return {
          id: entry.entryId,
          ...entry.data
        };
      }

      return null;
    },
  };
};
