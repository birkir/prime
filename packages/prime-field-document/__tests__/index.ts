import PrimeFieldDocument from '../src';

describe('PrimeFieldDocument', () => {
  let test: PrimeFieldDocument;

  beforeAll(() => {
    test = new PrimeFieldDocument({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldDocument).toBe('function');
  });

  it('should return same input for processInput', async () => {
    const input = [{ __inputname: 'foo', documentId: 'bar' }];
    expect(await test.processInput(input)).toBe(input);
  });
});
