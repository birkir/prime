import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import { Schema } from '../../../entities/Schema';
import { SchemaField } from '../../../entities/SchemaField';
import { PrimeFieldOperation } from '../../../utils/PrimeField';
import { uniqueTypeName } from '../utils/uniqueTypeNames';

export const createSchemaType = async ({
  name,
  schema,
  fields,
  resolvers,
}: {
  name: string;
  schema: Schema;
  fields: SchemaField[];
  resolvers: any;
}) => {
  const typeFields = {};

  for (const field of fields) {
    if (field.primeField && !field.parentFieldId) {
      const type = await field.primeField.outputType(
        {
          schema,
          fields,
          uniqueTypeName,
          resolvers: {},
        },
        PrimeFieldOperation.READ
      );
      if (type) {
        typeFields[field.name] = type;
      }
    }
  }

  return {
    args: {
      id: { type: GraphQLID },
      language: { type: GraphQLString },
    },
    type: new GraphQLObjectType({
      name,
      fields: typeFields,
    }),
  };
};
