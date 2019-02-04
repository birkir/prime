import PrimeFieldGroup from '../src';

describe('PrimeFieldGroup', () => {
  let test: PrimeFieldGroup;

  beforeAll(() => {
    test = new PrimeFieldGroup({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldGroup).toBe('function');
  });

  it('should return same input for processInput', async () => {
    const input = 1;
    expect(await test.processInput(input)).toBe(input);
  });
});
