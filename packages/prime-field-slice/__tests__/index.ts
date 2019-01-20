import PrimeFieldSlice from '../src';

describe('PrimeFieldSlice', () => {
  let test: PrimeFieldSlice;

  beforeAll(() => {
    test = new PrimeFieldSlice();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSlice).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });
});
