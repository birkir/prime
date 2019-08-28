import { PrimeField, PrimeFieldContext } from '@primecms/field';
import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import { camelCase, upperFirst } from 'lodash';

interface Options {
  schemaIds: string[];
  schemaId: string | null;
  multiple: boolean;
}

const NotFound = new GraphQLObjectType({
  name: 'Prime_Field_Document_NotFound',
  fields: {
    id: { type: GraphQLString },
    message: { type: GraphQLString },
  },
});

export class PrimeFieldDocument extends PrimeField {
  public static type: string = 'document';
  public static title: string = 'Document';
  public static description: string = 'Link and resolve documents';
  public static defaultOptions: Options = {
    schemaIds: [],
    schemaId: null,
    multiple: false,
  };

  public outputType(context: PrimeFieldContext) {
    const options = this.options;

    if (options.schemaId) {
      options.schemaIds.push(options.schemaId);
    }

    const types = options.schemaIds
      .map(schemaId => {
        const schema = context.schemas.find(s => s.id === schemaId);
        if (schema && context.types.has(schema.name)) {
          const type = context.types.get(schema.name)!.type;
          return { type, schema };
        }
      })
      .filter(t => !!t);

    if (types.length === 0) {
      return null;
    }

    if (this.options.multiple) {
      const unionType = new GraphQLUnionType({
        name: context.uniqueTypeName(`${context.name}_${this.schemaField.name}`),
        types: [...types.map(item => item.type), NotFound],
        async resolveType(value, ctx, info): Promise<GraphQLObjectType> {
          if (value._meta && value._meta.schemaId) {
            const foundType = types.find(({ schema }) => schema.id === value._meta.schemaId);
            if (foundType) {
              return foundType.type;
            }
          }

          return NotFound;
        },
      });

      return {
        type: new GraphQLList(unionType),
        args: {
          locale: { type: GraphQLString },
        },
        resolve: async (root, args, ctx, info) => {
          const values = root[this.schemaField.name] || [];
          return Promise.all(
            values.map(value => {
              const [schemaId, documentId] = value.split(',');
              const type = types.find(t => t.schema.id === schemaId);
              if (type) {
                const resolve = context.resolvers[type.schema.name];
                return resolve(root, { ...args, id: documentId }, ctx, info);
              }
              return null;
            })
          );
        },
      };
    } else {
      return {
        type: types[0].type,
        args: {
          locale: { type: GraphQLString },
        },
        resolve: async (root, args, ctx, info) => {
          const values: string[][] = []
            .concat(root[this.schemaField.name])
            .map(s => String(s).split(','));

          const entry = values.find(value => value[0] === types[0].schema.id);

          if (entry) {
            const [, id] = entry;
            const resolve = context.resolvers[types[0].schema.name];
            return resolve(root, { ...args, id }, ctx, info);
          }
          return null;
        },
      };
    }

    return null;
  }

  public inputType() {
    const options = this.options;

    return {
      type: options.multiple ? new GraphQLList(GraphQLID) : GraphQLID,
    };
  }

  public async whereType(context: PrimeFieldContext) {
    return new GraphQLInputObjectType({
      name: `${context.name}_${upperFirst(camelCase(this.schemaField.name))}_Where`,
      fields: {
        id: { type: GraphQLID },
      },
    });
  }
}
