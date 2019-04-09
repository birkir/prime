import PrimeFieldGeoPoint from '../src';

describe('PrimeFieldGeoPoint', () => {
  let test: PrimeFieldGeoPoint;
  const payload = {} as any;

  beforeAll(() => {
    test = new PrimeFieldGeoPoint({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldGeoPoint).toBe('function');
    expect(test).toBeTruthy();
  });

  it('should return same input for processInput', async () => {
    expect(await test.processInput(true)).toBe(true);
    expect(await test.processInput(false)).toBe(false);
  });

  it('should return same output for processOutput', async () => {
    expect(await test.processOutput(true)).toBe(true);
    expect(await test.processOutput(false)).toBe(false);
  });

  it('should have graphql output type', async () => {
    expect(await test.outputType(payload)).not.toBeNull();
  });

  it('should have graphql input type', async () => {
    expect(await test.inputType(payload)).not.toBeNull();
  });
});
