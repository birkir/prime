import DataLoader from 'dataloader';
import { Service } from 'typedi';
import { FindConditions, In, ObjectLiteral, Repository } from 'typeorm';
import { FindOptionsUtils } from 'typeorm/find-options/FindOptionsUtils';

@Service()
export class DataLoaderRepository<T> extends Repository<T> {
  public cache = new Map();

  public getLoader(where?: FindConditions<T> | ObjectLiteral | string) {
    const qb = this.createQueryBuilder();
    FindOptionsUtils.applyOptionsToQueryBuilder(qb, { where });
    qb.whereInIds([null]);
    const hash = Buffer.from(qb.getSql(), 'utf8').toString('hex');

    if (!this.cache.has(hash)) {
      this.cache.set(
        hash,
        new DataLoader(async keys => {
          const results = await this.find({
            where: {
              id: In(keys),
            },
          });
          return keys.map(key => results.find((r: any) => r.id === key));
        })
      );
    }

    return this.cache.get(hash);
  }

  public loadOne(id: string, where?: FindConditions<T> | ObjectLiteral | string) {
    if (['null', 'undefined'].indexOf(typeof id) >= 0) {
      return Promise.resolve(null);
    }

    return this.getLoader(where).load(id.toLowerCase());
  }
}
