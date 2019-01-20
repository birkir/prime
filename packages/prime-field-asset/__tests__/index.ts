import PrimeFieldAsset from '../src';

describe('PrimeFieldAsset', () => {
  let test: PrimeFieldAsset;

  beforeAll(() => {
    test = new PrimeFieldAsset();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldAsset).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });
});
