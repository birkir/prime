import PrimeFieldSlice from '../src';

describe('PrimeFieldSlice', () => {
  let test: PrimeFieldSlice;

  beforeAll(() => {
    test = new PrimeFieldSlice({ options: {} } as any, {} as any);
  });

  it('should have default export', () => {
    expect(typeof PrimeFieldSlice).toBe('function');
  });

  it('should have null where type', async () => {
    expect(await test.whereType()).toBeNull();
  });
});
