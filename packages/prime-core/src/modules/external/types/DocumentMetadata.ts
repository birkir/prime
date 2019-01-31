import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLISODateTime } from 'type-graphql';

export const DocumentMetadata = new GraphQLObjectType({
  name: 'PrimeDocument_Meta',
  fields: {
    locale: { type: GraphQLString },
    locales: { type: new GraphQLList(GraphQLString) },
    publishedAt: { type: GraphQLISODateTime },
    updatedAt: { type: GraphQLISODateTime },
    id: { type: GraphQLID },
  },
});
