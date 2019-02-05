import { PrimeFieldContext } from '@primecms/field';
import { PrimeFieldOperation } from '@primecms/field';
import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { SchemaVariant } from '../../../entities/Schema';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';
import { DocumentMetadata } from './DocumentMetadata';

export const createSchemaType = async ({
  name,
  schema,
  schemas,
  types,
  fields,
  resolvers,
}: SchemaPayload) => {
  let resolvedTypeFields = {};

  const resolveFieldsAsync = async () => {
    const typeFields: { [key: string]: any } = {
      id: { type: GraphQLID },
    };

    for (const field of fields) {
      if (field.primeField && !field.parentFieldId) {
        const type = await field.primeField.outputType(
          ({
            name,
            schema,
            schemas,
            types,
            fields,
            uniqueTypeName,
            resolvers,
          } as unknown) as PrimeFieldContext,
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

    if (schema.variant === SchemaVariant.Slice) {
      delete typeFields.id;
      delete typeFields._meta;
    }

    return typeFields;
  };

  return {
    args: {
      ...(!schema.settings.single && { id: { type: new GraphQLNonNull(GraphQLID) } }),
      locale: { type: GraphQLString },
    },
    type: new GraphQLObjectType({
      name,
      fields: () => resolvedTypeFields,
    }),
    variant: schema.variant,
    operation: PrimeFieldOperation.READ,
    asyncResolve() {
      return resolveFieldsAsync().then(typeFields => {
        resolvedTypeFields = typeFields;
      });
    },
  };
};
