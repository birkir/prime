import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { SchemaPayload } from '../interfaces/SchemaPayload';
import { uniqueTypeName } from '../utils/uniqueTypeNames';
import { PageInfo } from './PageInfo';

export const createSchemaConnectionType = (
  schemaPayload: SchemaPayload,
  SchemaType: GraphQLObjectType
) => {
  const { name } = schemaPayload;

  const ConnectionEdge = new GraphQLObjectType({
    name: uniqueTypeName(`${name}_ConnectionEdge`),
    fields: {
      node: { type: SchemaType },
      cursor: { type: GraphQLString },
    },
  });

  return new GraphQLObjectType({
    name: uniqueTypeName(`${name}_Connection`),
    fields: {
      edges: { type: new GraphQLList(ConnectionEdge) },
      pageInfo: { type: PageInfo },
      totalCount: { type: GraphQLInt },
    },
  });
};
