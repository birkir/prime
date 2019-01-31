import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { PrimeFieldOperation } from '../../../utils/PrimeField';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';

export const createSchemaInputType = async (
  { name, schema, fields, resolvers }: SchemaPayload,
  SchemaType: GraphQLObjectType,
  operation: PrimeFieldOperation.CREATE | PrimeFieldOperation.UPDATE = PrimeFieldOperation.CREATE
) => {
  const operationMap = {
    [PrimeFieldOperation.CREATE]: 'Create',
    [PrimeFieldOperation.UPDATE]: 'Update',
  };

  const typeName = uniqueTypeName(`${name}_${operationMap[operation]}Input`);
  const typeFields: { [key: string]: any } = {};

  for (const field of fields) {
    if (field.primeField && !field.parentFieldId) {
      const type = await field.primeField.inputType(
        {
          name,
          schema,
          fields,
          uniqueTypeName,
          resolvers,
        },
        operation
      );
      if (type) {
        typeFields[field.name] = type;
      }
    }
  }

  const InputType = new GraphQLInputObjectType({
    name: typeName,
    fields: typeFields,
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
  };
};
