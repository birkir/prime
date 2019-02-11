import { PrimeField, PrimeFieldContext } from '@primecms/field';
import { GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLObjectType } from 'graphql';

interface Options {
  required: boolean;
}

const GeoPoint = new GraphQLObjectType({
  name: 'Prime_Field_GeoPoint',
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    zoom: { type: GraphQLInt },
  },
});

const GeoPointInput = new GraphQLInputObjectType({
  name: 'Prime_Field_GeoPoint_Input',
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    zoom: { type: GraphQLInt },
  },
});

export class PrimeFieldGeoPoint extends PrimeField {
  public static type: string = 'geopoint';
  public static title: string = 'Geo Point';
  public static description: string = 'Geo point field';
  public static options: Options = {
    required: false,
  };

  public async outputType(context: PrimeFieldContext) {
    return {
      type: GeoPoint,
      description: this.schemaField.description,
    };
  }

  public async inputType(context: PrimeFieldContext) {
    return {
      type: GeoPointInput,
      description: this.schemaField.description,
    };
  }
}
