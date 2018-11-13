import { GraphQLString, GraphQLObjectType, GraphQLInt } from 'graphql';

export class ETImage {
  static output() {
    return {
      type: new GraphQLObjectType({
        name: 'ImageType',
        fields: {
          dimensions: {
            type: new GraphQLObjectType({
              name: 'ImageTypeDimensions',
              fields: {
                width: { type: GraphQLInt },
                height: { type: GraphQLInt },
              }
            }),
          },
          alt: { type: GraphQLString },
          copyright: { type: GraphQLString },
          url: { type: GraphQLString },
        },
      }),
    };
  }
}
