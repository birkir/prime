import { getUniqueHashId } from '../src/utils/getUniqueHashId';

describe('getUniqueHashId', () => {
  it('should export function', () => {
    expect(typeof getUniqueHashId).toBe('function');
  });

  it('should give hashid', async () => {
    const count = jest.fn(() => 0);
    const repository = {
      count,
    } as any;
    const id = await getUniqueHashId(repository);
    expect(id).toBeTruthy();
    expect(count).toBeCalledTimes(1);
  });

  it('should give hashid', async () => {
    let counter = 2;
    const count = jest.fn(() => --counter);
    const repository = {
      count,
    } as any;
    const id = await getUniqueHashId(repository);
    expect(id).toBeTruthy();
    expect(count).toBeCalledTimes(2);
  });
});
