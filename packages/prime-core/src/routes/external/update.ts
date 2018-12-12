import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { ensurePermitted } from './utils/ensurePermitted';
import { resolveFieldType } from './utils/resolveFieldType';
import { entryTransformer } from './index';

export const update = ({ GraphQLContentType, contentType, contentTypes, queries }) => {
  const typeArgs: any = { // tslint:disable-line no-any
    id: { type: new GraphQLNonNull(GraphQLID) },
    language: { type: GraphQLString },
    publish: { type: GraphQLBoolean }
  };

  const inputFields = contentType.fields.reduce(
    (acc, field: ContentTypeField) => {
      const fieldType = resolveFieldType(field);
      if (fieldType) {
        acc[field.name] = fieldType.getGraphQLInput({
          field,
          queries,
          contentType,
          contentTypes,
          resolveFieldType,
          isUpdate: true
        });
      }
      if (!acc[field.name]) {
        delete acc[field.name];
      }

      return acc;
    },
    {}
  );

  if (Object.keys(inputFields).length > 0) {
    typeArgs.input = {
      type: new GraphQLInputObjectType({
        name: `${contentType.name}UpdateInput`,
        fields: inputFields
      })
    };
  }

  return {
    type: GraphQLContentType,
    args: typeArgs,
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'update');

      const { input, language = 'en', publish = false, id } = args;

      let entry = await ContentEntry.findOne({
        where: {
          contentTypeId: contentType.id,
          entryId: id,
          language: language
          // @todo add isPublished = context.published
          // @todo add contentReleaseId = context.releaseId
        },
        order: [['createdAt', 'DESC']]
      });

      const data = await entryTransformer.transformInput(input, contentType.id);

      if (entry) {

        if (input) {
          entry = await entry.draft(data, language);
        }

        if (publish) {
          entry = await entry.publish();
        }

        if (entry && queries[contentType.name]) {
          return queries[contentType.name].resolve(root, { id, language }, context, info);
        }
      }

      return null;
    }
  };
};
