import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

export const contentEntryMetaType = new GraphQLObjectType({
  name: 'DocumentMeta',
  fields: {
    language: { type: GraphQLString },
    languages: { type: new GraphQLList(GraphQLString) },
    published: { type: GraphQLBoolean },
    timestamp: { type: GraphQLString },
    versionId: { type: GraphQLID },
  },
});
