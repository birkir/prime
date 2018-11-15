import { GraphQLInputObjectType, GraphQLID } from 'graphql';

import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';

export const update = (GraphQLContentType, contentType) => {
  return {
    type: GraphQLContentType,
    args: {
      id: { type: GraphQLID },
      input: {
        type: new GraphQLInputObjectType({
          name: `Update${contentType.name}`,
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
      const entry = await ContentEntry.find({
        where: {
          contentTypeId: contentType.id,
          id: args.id,
        },
      });

      if (entry) {
        entry.update({
          data: args.input,
        });

        return {
          id: entry.id,
          ...entry.data
        };
      }

      return null;
    },
  };
};
