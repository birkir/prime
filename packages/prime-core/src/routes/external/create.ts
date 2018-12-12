import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { ensurePermitted } from './utils/ensurePermitted';
import { resolveFieldType } from './utils/resolveFieldType';
import { entryTransformer } from './index';

export const create = ({ GraphQLContentType, contentType, contentTypes, queries }) => {

  const typeArgs: any = { // tslint:disable-line no-any
    language: { type: GraphQLString }
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
          resolveFieldType
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
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: `${contentType.name}CreateInput`,
        fields: {
          ...inputFields
        }
      }))
    };
  }

  return {
    type: GraphQLContentType,
    args: typeArgs,
    async resolve(root, args, context, info) {
      await ensurePermitted(context, contentType, 'create');
      const { language = context.language, input } = args;

      const data = await entryTransformer.transformInput(input, contentType.id);

      const entry = await ContentEntry.create({
        contentTypeId: contentType.id,
        isPublished: true,
        language,
        data
      });

      if (entry && queries[contentType.name]) {
        return queries[contentType.name].resolve(root, { id: entry.entryId, language }, context, info);
      }

      return null;
    }
  };
};
