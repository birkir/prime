import { Brackets } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';

export class ExtendedConnection<T> extends EntityConnection<T> {
  public totalCountField = 'id';

  public get totalCount(): Promise<number> {
    return new Promise(async resolve => {
      const result = await this.createAppliedQueryBuilder(true)
        .select(`COUNT(DISTINCT "${this.totalCountField}")`, 'cnt')
        .getRawOne();
      resolve((result && result.cnt) || 0);
    });
  }

  public createAppliedQueryBuilder(counter = false) {
    const queryBuilder = this.repository.createQueryBuilder();

    if (this.where) {
      (this.where as any)(queryBuilder, counter);
    }

    if (this.afterSelector) {
      queryBuilder.andWhere(this.afterSelector);
    }

    if (this.beforeSelector) {
      queryBuilder.andWhere(this.beforeSelector);
    }

    return queryBuilder;
  }

  public async query(): Promise<T[]> {
    const { sortOptions } = this;

    const queryBuilder = this.createAppliedQueryBuilder();

    const reverse = typeof this.args.last === 'number';
    const appliedOrderMap: any = {
      ASC: reverse ? 'DESC' : 'ASC',
      DESC: reverse ? 'ASC' : 'DESC',
    };

    queryBuilder.orderBy();

    for (const { sort, order } of sortOptions) {
      queryBuilder.addOrderBy(`"${sort}"`, appliedOrderMap[order]);
    }

    if (this.limit) {
      queryBuilder.limit(this.limit);
    }

    const entities = await queryBuilder.getMany();
    if (reverse) {
      entities.reverse();
    }
    return entities;
  }

  protected keyToSelector(key: any[], direction: 'after' | 'before'): Brackets {
    const eq = direction === 'after' ? ['>', '<', '>=', '<='] : ['<', '>', '<=', '>='];
    const { sortOptions } = this.options;

    return new Brackets(rootQb => {
      for (let i = 0; i < sortOptions.length; i++) {
        const subKeySetComparison = new Brackets(qb => {
          const subKeySet = key.slice(0, i + 1);

          for (let j = 0; j < subKeySet.length; j++) {
            const { sort, order } = sortOptions[j];
            const cursorKey = subKeySet[j];
            const paramterName = `${direction}__${sort}`;

            let equality: string;
            if (j === i) {
              equality = order === 'ASC' ? eq[0] : eq[1];
            } else {
              equality = order === 'ASC' ? eq[2] : eq[3];
            }
            qb.andWhere(`"${sort}" ${equality} :${paramterName}`, { [paramterName]: cursorKey });
          }
        });
        rootQb.orWhere(subKeySetComparison);
      }
    });
  }
}
