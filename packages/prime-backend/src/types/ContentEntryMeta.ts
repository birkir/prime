import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean } from 'graphql';

export const ContentEntryMeta = new GraphQLObjectType({
  name: 'ContentEntryMeta',
  fields: {
    language: { type: GraphQLString },
    languages: { type: new GraphQLList(GraphQLString) },
    isPublished: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
