import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

export const DocumentMetadata = new GraphQLObjectType({
  name: 'PrimeDocument_Meta',
  fields: {
    locale: { type: GraphQLString },
    locales: { type: new GraphQLList(GraphQLString) },
    publishedAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    id: { type: GraphQLID },
  },
});
