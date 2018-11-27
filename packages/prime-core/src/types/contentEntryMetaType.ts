import { GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

export const contentEntryMetaType = new GraphQLObjectType({
  name: 'ContentEntryMeta',
  fields: {
    language: { type: GraphQLString },
    languages: { type: new GraphQLList(GraphQLString) },
    isPublished: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  }
});
