import DataLoader from 'dataloader';
import { Service } from 'typedi';
import { FindConditions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { FindOptionsUtils } from 'typeorm/find-options/FindOptionsUtils';

@Service()
export class DataLoaderRepository<T> extends Repository<T> {
  public cache = new Map();

  public getLoader(
    qb: SelectQueryBuilder<T>,
    keyMatcher?: (qb: SelectQueryBuilder<T>, keys: string[]) => void,
    keyName: string = 'id',
    raw: boolean = false
  ) {
    const hashKey = qb.getQuery() + JSON.stringify(qb.getParameters());
    const hash = Buffer.from(hashKey, 'utf8').toString('hex');

    if (!this.cache.has(hash)) {
      this.cache.set(
        hash,
        new DataLoader(async keys => {
          const b = qb.clone();

          if (keyMatcher) {
            keyMatcher(b, keys as any);
          } else {
            b.andWhereInIds(keys);
          }
          const results = await b.getRawAndEntities();
          if (raw) {
            results.raw.forEach((r, i) => Object.assign(results.entities[i], r));
          }
          return keys.map(key => results.entities.find((r: any) => r[keyName] === key));
        })
      );
    }

    return this.cache.get(hash);
  }

  public loadOne(id: string, where?: FindConditions<T> | ObjectLiteral | string) {
    if (['null', 'undefined'].indexOf(typeof id) >= 0) {
      return Promise.resolve(null);
    }
    const qb = this.createQueryBuilder();
    FindOptionsUtils.applyOptionsToQueryBuilder(qb, { where });
    return this.getLoader(qb).load(id.toLowerCase());
  }
}
