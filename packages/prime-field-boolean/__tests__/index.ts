import PrimeFieldBoolean from '../src';

describe('PrimeFieldBoolean', () => {
  let test: PrimeFieldBoolean;

  beforeAll(() => {
    test = new PrimeFieldBoolean();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldBoolean).toBe('function');
  });

  it('should return same input for processInput', () => {
    expect(test.processInput(true)).toBe(true);
    expect(test.processInput(false)).toBe(false);
  });

  it('should return same output for processOutput', () => {
    expect(test.processOutput(true)).toBe(true);
    expect(test.processOutput(false)).toBe(false);
  });

  it('should have graphql output type', () => {
    expect(test.getGraphQLOutput()).not.toBeNull();
  });

  it('should have graphql input type', () => {
    expect(test.getGraphQLInput()).not.toBeNull();
  });

  it('should have graphql where type', () => {
    expect(test.getGraphQLWhere()).not.toBeNull();
  });
});
