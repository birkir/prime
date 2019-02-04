import { GraphQLString } from 'graphql';
import PrimeFieldAsset from '../src';

describe('PrimeFieldAsset', () => {
  let test: PrimeFieldAsset;
  const imageUrl = 'http://res.cloudinary.com/foo/image/upload/vFOO/bar.jpg';
  const imageThumbUrl =
    'http://res.cloudinary.com/foo/image/upload/w_100,h_80,x_10,y_15,c_crop/w_100,h_80/vFOO/bar.jpg';

  beforeAll(() => {
    test = new PrimeFieldAsset();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldAsset).toBe('function');
  });

  it('should have GraphQLString output type', () => {
    const type = test.getGraphQLOutput({
      field: { options: { crops: [{ name: 'thumb', width: 100, height: 80 }] } },
    } as any)!;
    expect(type.type).toBeTruthy();
    expect(type.resolve({}, {}, {}, { fieldName: 'foo' })).toBeNull();
    expect(type.resolve({ foo: { url: imageUrl } }, {}, {}, { fieldName: 'foo' })).toEqual(
      imageUrl
    );
    expect(
      type.resolve(
        {
          foo: { url: imageUrl, crops: [{ name: 'thumb', width: 100, height: 80, x: 10, y: 15 }] },
        },
        { crop: 'thumb' },
        {},
        { fieldName: 'foo' }
      )
    ).toEqual(imageThumbUrl);
    expect(
      type.resolve({ foo: { url: imageUrl } }, { crop: 'thumb' }, {}, { fieldName: 'foo' })
    ).toBeNull();
  });

  it('should have GraphQLString input type', () => {
    expect(test.getGraphQLInput()!.type).toBe(GraphQLString);
  });

  it('should have null where type', () => {
    expect(test.getGraphQLWhere()).toBeNull();
  });
});
