import { get } from 'lodash';
import { Brackets } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { DocumentTransformer } from '../../../utils/DocumentTransformer';

export class FindAllConnection<T> extends EntityConnection<T> {
  public documentTransformer: DocumentTransformer;
  public totalCount: number | null = null;

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

  public resolveCursor(item: T): string {
    const key = this.sortOptions.map(({ sort }) => {
      if (sort.indexOf('->') === -1) {
        return item[sort.replace(/^\"/, '').replace(/\"$/, '')];
      }
      const path = sort
        .split('->')
        .slice(1)
        .map(n => n.substr(1, n.length - 2))
        .join('.');
      return get(item, `data.${path}`);
    });

    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  public async query(): Promise<T[]> {
    const { sortOptions } = this;

    const queryBuilder = this.createAppliedQueryBuilder(true);

    const reverse = typeof this.args.last === 'number';
    const appliedOrderMap: any = {
      ASC: reverse ? 'DESC' : 'ASC',
      DESC: reverse ? 'ASC' : 'DESC',
    };

    queryBuilder.orderBy();

    for (const { sort, order } of sortOptions) {
      queryBuilder.addOrderBy(sort, appliedOrderMap[order]);
    }

    if (this.limit) {
      queryBuilder.limit(this.limit);
    }

    const result = await queryBuilder.getRawAndEntities();

    if (reverse) {
      result.entities.reverse();
    }

    result.raw.forEach((item, i) => {
      (result.entities[i] as any).locales = item.locales;
    });

    return result.entities;
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
            const paramterName = Buffer.from(`${direction}__${sort}`).toString('hex');
            let realSort = sort;

            // allow JSONB sorting
            if (sort.indexOf('->') >= 0) {
              const arrowSort = sort.slice(0).split('->');
              const lastSort = arrowSort.pop();
              realSort = `${arrowSort.join('->')}->>${lastSort}`;
            }

            let equality: string;
            if (j === i) {
              equality = order === 'ASC' ? eq[0] : eq[1];
            } else {
              equality = order === 'ASC' ? eq[2] : eq[3];
            }
            qb.andWhere(`${realSort} ${equality} :${paramterName}`, {
              [paramterName]: cursorKey,
            });
          }
        });
        rootQb.orWhere(subKeySetComparison);
      }
    });
  }
}
