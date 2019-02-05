import { PrimeFieldContext, PrimeFieldOperation } from '@primecms/field';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { SchemaVariant } from '../../../entities/Schema';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';

export const createSchemaInputType = async (
  { name, schema, schemas, types, fields, resolvers }: SchemaPayload,
  SchemaType: GraphQLObjectType,
  operation: PrimeFieldOperation.CREATE | PrimeFieldOperation.UPDATE = PrimeFieldOperation.CREATE
) => {
  const operationMap = {
    [PrimeFieldOperation.CREATE]: 'Create',
    [PrimeFieldOperation.UPDATE]: 'Update',
  };

  let resolvedTypeFields = {};

  const typeName = uniqueTypeName(`${name}_${operationMap[operation]}Input`);

  const resolveFieldsAsync = async () => {
    const typeFields: { [key: string]: any } = {};

    if (schema.variant === SchemaVariant.Slice) {
      typeFields.___inputname = { type: GraphQLString };
    }

    for (const field of fields) {
      if (field.primeField && !field.parentFieldId) {
        const type = await field.primeField.inputType(
          ({
            name,
            schema,
            schemas,
            types,
            fields,
            uniqueTypeName,
            resolvers,
          } as unknown) as PrimeFieldContext,
          operation
        );
        if (type) {
          typeFields[field.name] = type;
        }
      }
    }

    return typeFields;
  };

  const InputType = new GraphQLInputObjectType({
    name: typeName,
    fields: () => resolvedTypeFields,
  });

  return {
    args: {
      ...(operation === PrimeFieldOperation.UPDATE && {
        id: { type: new GraphQLNonNull(GraphQLID), description: 'Can be hashid or UUID' },
        merge: {
          type: GraphQLBoolean,
          description: 'Merge updated input (instead of replacing)',
          defaultValue: true,
        },
      }),
      locale: { type: GraphQLString },
      input: { type: new GraphQLNonNull(InputType) },
    },
    type: SchemaType,
    variant: schema.variant,
    operation,
    asyncResolve() {
      return resolveFieldsAsync().then(typeFields => {
        resolvedTypeFields = typeFields;
      });
    },
  };
};
