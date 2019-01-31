import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import { PrimeFieldOperation } from '../../../utils/PrimeField';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';
import { DocumentMetadata } from './DocumentMetadata';

export const createSchemaType = async ({ name, schema, fields, resolvers }: SchemaPayload) => {
  const typeFields: { [key: string]: any } = {
    id: { type: GraphQLID },
  };

  for (const field of fields) {
    if (field.primeField && !field.parentFieldId) {
      const type = await field.primeField.outputType(
        {
          name,
          schema,
          fields,
          uniqueTypeName,
          resolvers,
        },
        PrimeFieldOperation.READ
      );
      if (type) {
        typeFields[field.name] = type;
      }
    }
  }

  typeFields._meta = {
    type: DocumentMetadata,
  };

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
