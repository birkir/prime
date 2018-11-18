import { GraphQLID } from 'graphql';
import PrimeField from '@primecms/field';

interface FieldOptions {
  contentTypeId: string;
  single: boolean;
}

/**
 * Pure text field
 */
export default class PrimeFieldDocument extends PrimeField {

  id = 'document';
  title = 'Document';
  description = 'Link and resolve document';

  /**
   * Default options for field
   */
  defaultOptions: FieldOptions = {
    contentTypeId: null as any,
    single: true,
  };

  /**
   * GraphQL type for output query
   */
  GraphQL({ field, queries, contentTypes }) {
    const { options } = field;

    if (options.contentTypeId) {
      const contentType = contentTypes.find(ct => ct.id === options.contentTypeId);
      if (contentType && queries[contentType.name]) {
        const query = queries[contentType.name];
        const { type } = query;
        return {
          type,
          async resolve(root, args, context, info) {
            const id = root[field.name];
            if (!id) {
              return null
            }
            return await query.resolve(root, { id }, context, info);
          },
        };
      }
    }

    return null;
  }

  /**
   * GraphQL type for input mutation
   */
  GraphQLInput({ field, queries, contentTypes, isUpdate }) {
    return {
      type: GraphQLID,
    }
  }

  /**
   * GraphQL type for where query
   */
  GraphQLWhere() {
    return null;
  }
}
