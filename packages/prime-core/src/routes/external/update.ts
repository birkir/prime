import { GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './utils/resolveFieldType';
import { ensurePermitted } from './utils/ensurePermitted';

export const update = ({ GraphQLContentType, contentType, contentTypes, queries }) => {
  const args: any = {
    id: { type: new GraphQLNonNull(GraphQLID) },
    language: { type: GraphQLString },
    publish: { type: GraphQLBoolean },
  };

  const inputFields = contentType.fields.reduce((acc, field: ContentTypeField) => {
    const fieldType = resolveFieldType(field);
    if (fieldType) {
      acc[field.name] = fieldType.getGraphQLInput({
        field,
        queries,
        contentType,
        contentTypes,
        resolveFieldType,
        isUpdate: true,
      });
    }
    if (!acc[field.name]) {
      delete acc[field.name];
    }
    return acc;
  }, {});

  if (Object.keys(inputFields).length > 0) {
    args.input = {
      type: new GraphQLInputObjectType({
        name: `${contentType.name}UpdateInput`,
        fields: {
          ...inputFields,
        },
      }),
    };
  }

  return {
    type: GraphQLContentType,
    args,
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'update');

      const { input, language = 'en', publish = false, id } = args;

      let entry = await ContentEntry.findOne({
        where: {
          contentTypeId: contentType.id,
          entryId: id,
          language: language,
          // @todo add isPublished = context.published
          // @todo add contentReleaseId = context.releaseId
        },
        order: [['createdAt', 'DESC']],
      });

      if (entry) {

        if (input) {
          entry = await entry.draft(input, language);
        }

        if (publish) {
          entry = await entry.publish();
        }

        if (entry && queries[contentType.name]) {
          return await queries[contentType.name].resolve(root, { id, language }, context, info);
        }
      }

      return null;
    },
  };
};
