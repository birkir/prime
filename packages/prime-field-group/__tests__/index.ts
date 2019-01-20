import PrimeFieldGroup from '../src';

describe('PrimeFieldGroup', () => {
  let test: PrimeFieldGroup;

  beforeAll(() => {
    test = new PrimeFieldGroup();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldGroup).toBe('function');
  });

  it('should return same input for processInput', () => {
    const input = 1;
    expect(test.processInput(input, {} as any)).toBe(input);
  });
});
