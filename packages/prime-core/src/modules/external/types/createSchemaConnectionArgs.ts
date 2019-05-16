import { PrimeFieldContext } from '@primecms/field';
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { camelCase, upperFirst } from 'lodash';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';

const OrderEnum = new GraphQLEnumType({
  name: 'Order',
  values: {
    ASC: { value: 'ASC' },
    DESC: { value: 'DESC' },
  },
});

export const createSchemaConnectionArgs = async ({
  name,
  fields,
  schema,
  schemas,
  resolvers,
}: SchemaPayload) => {
  const sortName = uniqueTypeName(`${name}_Sort`);
  const sortFields = {};

  const whereName = uniqueTypeName(`${name}_Where`);
  const whereFields = {};

  const addFieldSort = (field, sortKey, acc) => {
    const children = fields.filter(f => f.parentFieldId === field.id);
    if (children.length) {
      const subSortName = uniqueTypeName(`${sortKey}_${upperFirst(camelCase(field.name))}`);
      const subSortFields = {};
      for (const subfield of fields) {
        if (subfield.parentFieldId === field.id && field.primeField) {
          addFieldSort(subfield, subSortName, subSortFields);
        }
      }
      if (Object.keys(subSortFields).length) {
        acc[field.name] = {
          type: new GraphQLInputObjectType({
            name: subSortName,
            fields: subSortFields,
          }),
        };
      }
    } else {
      acc[field.name] = { type: OrderEnum };
    }
  };

  for (const field of fields) {
    if (field.parentFieldId === null && field.primeField) {
      const WhereType = await field.primeField.whereType(({
        fields,
        schema,
        schemas,
        name: whereName,
        resolvers,
        uniqueTypeName,
      } as unknown) as PrimeFieldContext);

      addFieldSort(field, sortName, sortFields);

      if (WhereType) {
        whereFields[field.name] = {
          type: WhereType,
        };
      }
    }
  }

  const SortInputType = new GraphQLInputObjectType({
    name: sortName,
    fields: sortFields,
  });

  const WhereInputType = new GraphQLInputObjectType({
    name: whereName,
    fields: () => ({
      ...whereFields,
      OR: { type: new GraphQLList(WhereInputType) },
      AND: { type: new GraphQLList(WhereInputType) },
    }),
  });

  const args: { [key: string]: any } = {
    locale: { type: GraphQLString },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    before: { type: GraphQLString },
    after: { type: GraphQLString },
  };

  if (Object.keys(SortInputType.getFields()).length) {
    args.sort = { type: new GraphQLList(SortInputType) };
  }

  if (Object.keys(WhereInputType.getFields()).length) {
    args.where = { type: new GraphQLList(WhereInputType) };
  }

  return args;
};
