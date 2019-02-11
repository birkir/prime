import PrimeFieldGeoPoint from '../src';

describe('PrimeFieldGeoPoint', () => {
  let test: PrimeFieldGeoPoint;
  const payload = {} as any;

  beforeAll(() => {
    test = new PrimeFieldGeoPoint({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldGeoPoint).toBe('function');
  });
});
