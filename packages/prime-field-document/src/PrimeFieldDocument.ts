import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLID } from 'graphql';

interface IPrimeFieldDocumentOptions {
  contentTypeId: string | null;
  single: boolean;
}

export class PrimeFieldDocument extends PrimeField {

  public id: string = 'document';
  public title: string = 'Document';
  public description: string = 'Link and resolve document';

  public defaultOptions: IPrimeFieldDocumentOptions = {
    contentTypeId: null,
    single: true
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { field, queries, contentTypes } = args;
    const { options } = field;
    if (options.contentTypeId) {
      const contentType = contentTypes.find(ct => ct.id === options.contentTypeId);
      if (contentType && queries[contentType.name]) {
        const query = queries[contentType.name];
        const { type } = query;

        return {
          type,
          async resolve(root, unusedArgs, context, info) {
            const id = root[field.name];
            if (!id) {
              return null;
            }

            return query.resolve(root, { id }, context, info);
          }
        };
      }
    }

    return null;
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    return {
      type: GraphQLID
    };
  }

  public getGraphQLWhere() {
    return null;
  }
}
