import { IPrimeFieldGraphQLArguments, PrimeField } from '@primecms/field';
import { GraphQLString } from 'graphql';
import { get } from 'lodash';

export class PrimeFieldAsset extends PrimeField {
  public id: string = 'asset';
  public title: string = 'Asset';
  public description: string = 'Images, videos and other assets';

  public defaultOptions: {} = {};

  public getGraphQLOutput({ field }: IPrimeFieldGraphQLArguments) {
    const options = this.getOptions(field);

    return {
      args: {
        crop: { type: GraphQLString },
      },
      type: GraphQLString,
      resolve(root, args, context, info) {
        const data = get(root, info.fieldName, {});
        let image = get(data, 'url', '');

        const fieldCrops = get(options, 'crops', []);
        const crops = get(data, 'crops', []);
        if (args.crop) {
          const crop = crops.find((c: { name: string }) => c.name === args.crop);
          const fieldCrop = fieldCrops.find((c: { name: string }) => c.name === args.crop);
          if (crop && fieldCrop) {
            const mods = [
              ['w', Math.round(crop.width)],
              ['h', Math.round(crop.height)],
              ['x', Math.round(crop.x)],
              ['y', Math.round(crop.y)],
              ['c', 'crop'],
            ].map(([key, val]) => `${key}_${val}`);

            image = image.replace(
              '/image/upload/',
              `/image/upload/${mods.join(',')}/w_${Math.round(fieldCrop.width)},h_${Math.round(
                fieldCrop.height
              )}/`
            );
          } else {
            return null;
          }
        }

        if (!image || image === '') {
          return null;
        }

        return image;
      },
    };
  }

  public getGraphQLInput() {
    return {
      type: GraphQLString,
    };
  }

  public getGraphQLWhere() {
    return null;
  }
}
