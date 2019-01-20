import PrimeFieldDocument from '../src';

describe('PrimeFieldDocument', () => {
  let test: PrimeFieldDocument;

  beforeAll(() => {
    test = new PrimeFieldDocument();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDocument).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });
});
