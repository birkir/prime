import PrimeFieldDateTime from '../src';

describe('PrimeFieldDateTime', () => {
  let test: PrimeFieldDateTime;

  beforeAll(() => {
    test = new PrimeFieldDateTime();
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDateTime).toBe('function');
  });

  it('should have graphql input type', () => {
    expect(test.getGraphQLInput({ field: {} } as any)).not.toBeNull();
  });

  it('should have graphql output type', () => {
    expect(test.getGraphQLOutput({ field: {} } as any)).not.toBeNull();
  });

  it('should have graphql where type', () => {
    expect(test.getGraphQLWhere({ field: {} } as any)).not.toBeNull();
  });
});
