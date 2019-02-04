import { UserInputError } from 'apollo-server-core';
import { SchemaField } from '../../../entities/SchemaField';

export type Order = 'ASC' | 'DESC';

export interface NestedSort {
  [key: string]: Order | NestedSort;
}

export interface SortOption {
  sort: string;
  order: 'ASC' | 'DESC';
}

export const getSortOptions = (
  tableName: string,
  fields: SchemaField[],
  sort: NestedSort | NestedSort[],
  scope: string[] = [],
  acc: SortOption[] = [],
  orderScopes = new Set()
) => {
  if (Array.isArray(sort)) {
    sort.forEach(item => getSortOptions(tableName, fields, item, scope, acc));
  } else {
    for (const [fieldName, dirOrSort] of Object.entries(sort)) {
      const field = fields.find(
        f => f.name === fieldName && f.parentFieldId === (scope[scope.length - 1] || null)
      );
      if (field && field.primeField) {
        const nextScope = [...scope, field.id];
        const scopeKey = nextScope.map(s => `'${s}'`).join('->');
        if (orderScopes.has(scopeKey)) {
          throw new UserInputError('Cannot sort by same field twice');
        }
        orderScopes.add(scopeKey);
        if (typeof dirOrSort === 'string') {
          acc.push({ sort: `"${tableName}"."data"->${scopeKey}`, order: dirOrSort });
        } else {
          getSortOptions(tableName, fields, dirOrSort, nextScope, acc);
        }
      }
    }
  }
  return acc;
};
