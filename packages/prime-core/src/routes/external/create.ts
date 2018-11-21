import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './utils/resolveFieldType';
import { ensurePermitted } from './utils/ensurePermitted';

export const create = ({ GraphQLContentType, contentType, contentTypes, queries }) => {
  const args: any = {
    language: { type: GraphQLString },
  };

  const inputFields = contentType.fields.reduce((acc, field: ContentTypeField) => {
    const FieldType = resolveFieldType(field);
    if (FieldType && FieldType.GraphQLInput) {
      acc[field.name] = FieldType.GraphQLInput({
        field,
        queries,
        contentType,
        contentTypes,
        resolveFieldType,
      });
    }
    if (!acc[field.name]) {
      delete acc[field.name];
    }
    return acc;
  }, {});

  if (Object.keys(inputFields).length > 0) {
    args.input = {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: `${contentType.name}CreateInput`,
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
      await ensurePermitted(context, contentType, 'create');
      const { language = context.language, input } = args;

      const entry = await ContentEntry.create({
        entryId: await ContentEntry.getRandomId(),
        contentTypeId: contentType.id,
        isPublished: true,
        language,
        data: input,
      });

      if (entry && queries[contentType.name]) {
        return await queries[contentType.name].resolve(root, { id: entry.entryId, language }, context, info);
      }

      return null;
    },
  };
};
