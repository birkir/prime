import { GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLNonNull } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';
import { ensurePermitted } from './utils/ensurePermitted';

export const update = (GraphQLContentType, contentType, queries) => {
  const args: any = {
    id: { type: new GraphQLNonNull(GraphQLID) },
    language: { type: GraphQLString },
  };

  const inputFields = contentType.fields.reduce((acc, field: ContentTypeField) => {
    const FieldType = resolveFieldType(field);
    if (FieldType && FieldType.input) {
      acc[field.name] = FieldType.input(field, queries, contentType, 'Update');
    }
    if (!acc[field.name]) {
      delete acc[field.name];
    }
    return acc;
  }, {});

  if (Object.keys(inputFields).length > 0) {
    args.input = {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: `Update${contentType.name}`,
        fields: {
          ...inputFields,
        },
      })),
    };
  }

  return {
    type: GraphQLContentType,
    args,
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'update');

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
