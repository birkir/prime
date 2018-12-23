import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLUnionType } from 'graphql';

interface IPrimeFieldDocumentOptions {
  contentTypeIds: string[] | null;
  contentTypeId: string | null;
  multiple: boolean;
}

export class PrimeFieldDocument extends PrimeField {

  public id: string = 'document';
  public title: string = 'Document';
  public description: string = 'Link and resolve documents';

  public defaultOptions: IPrimeFieldDocumentOptions = {
    contentTypeIds: null,
    contentTypeId: null,
    multiple: false
  };

  public getGraphQLOutput(args: IPrimeFieldGraphQLArguments) {
    const { field, queries, contentTypes, models } = args;
    const options = this.getOptions(field);

    options.contentTypeIds = options.contentTypeIds || [];

    if (options.contentTypeId) {
      options.contentTypeIds.push(options.contentTypeId);
    }

    const entryMap = new Map();
    const getEntryType = async (id: string) => {
      if (!id || typeof id !== 'string') {
        return null;
      }

      if (entryMap.has(id)) {
        return entryMap.get(id);
      }

      // @todo do we want to cache failed lookups
      // entryMap.set(id, { resolve: null, type: null });

      const entry = await models.ContentEntry.findOne({ where: { entryId: id } });

      if (!entry) {
        return null;
      }

      const type = types.find(({ contentTypeId }) => contentTypeId === entry.contentTypeId);

      if (!type) {
        return null;
      }

      entryMap.set(id, type);

      return type;
    };

    const types = options.contentTypeIds.map(contentTypeId => {
      const contentType = contentTypes.find(ct => ct.id === contentTypeId);
      if (!contentType || !queries[contentType.name]) {
        return null;
      }
      const query = queries[contentType.name];

      return { contentTypeId, type: query.type, resolve: query.resolve };
    });

    if (types.filter(n => !!n).length === 0) {
      return null;
    }

    const unionType = new GraphQLUnionType({
      name: `${args.contentType.name}_${field.apiName}`,
      types: types.map(({ type }) => type),
      async resolveType(value, context, info): Promise<GraphQLObjectType> {
        const entry = await getEntryType(value.id || value);

        if (!entry) {
          throw new Error('Unknown error');
        }

        return entry.type;
      }
    });

    if (options.multiple) {
      return {
        type: new GraphQLList(unionType),
        async resolve(root, unusedArgs, context, info) {
          const value = root[field.name];
          const ids = Array.isArray(value) ? value : [value];

          return Promise.all(ids.map(async (id) => {
            const entry = await getEntryType(id);

            return entry && entry.resolve(root, { id }, context, info);
          }));
        }
      };
    }

    return {
      type: unionType,
      async resolve(root, unusedArgs, context, info) {
        const value = root[field.name];
        const id = Array.isArray(value) ? value[0] : value;
        const entry = await getEntryType(id);

        return entry && entry.resolve(root, { id }, context, info);
      }
    };
  }

  public getGraphQLInput(args: IPrimeFieldGraphQLArguments) {
    const { field } = args;
    const options = this.getOptions(field);

    return {
      type: options.multiple ? new GraphQLList(GraphQLID) : GraphQLID
    };
  }

  public getGraphQLWhere() {
    return null;
  }
}
