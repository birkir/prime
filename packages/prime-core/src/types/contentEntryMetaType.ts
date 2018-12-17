import { GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';

export const contentEntryMetaType = new GraphQLObjectType({
  name: 'ContentEntryMeta',
  fields: {
    language: { type: GraphQLString },
    languages: { type: new GraphQLList(GraphQLString) },
    published: { type: GraphQLBoolean },
    timestamp: { type: GraphQLString },
    versionId: { type: GraphQLID }
  }
});
