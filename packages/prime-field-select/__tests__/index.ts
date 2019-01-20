import PrimeFieldSelect from '../src';

describe('PrimeFieldSelect', () => {
  let test: PrimeFieldSelect;

  beforeAll(() => {
    test = new PrimeFieldSelect();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSelect).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });
});
