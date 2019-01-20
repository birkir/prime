import { latestPrimeVersion } from '../src/utils/latestPrimeVersion';

describe('latestPrimeVersion', () => {
  it('should have latestPrimeVersion export', () => {
    expect(typeof latestPrimeVersion).toBe('function');
  });
});
