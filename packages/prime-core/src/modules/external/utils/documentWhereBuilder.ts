import { Brackets, WhereExpression } from 'typeorm';
import { SchemaField } from '../../../entities/SchemaField';

interface Where {
  gt?: any;
  gte?: any;
  lt?: any;
  lte?: any;
  eq?: any;
  in?: any;
  contains?: any;
}

export interface NestedWhere {
  [key: string]: undefined | Where | NestedWhere[];
  OR?: NestedWhere[];
  AND?: NestedWhere[];
}

const operators = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  eq: '=',
  in: 'IN',
  contains: 'LIKE',
  not: '!=',
};

const modes = { OR: 'orWhere', AND: 'andWhere' };

export const documentWhereBuilder = (
  tableName: string,
  fields: SchemaField[],
  queryBuilder: WhereExpression,
  where: Where | NestedWhere,
  scope: string[] = [],
  mode: string = 'andWhere'
) => {
  for (const [fieldName, whereOrValue] of Object.entries(where)) {
    if (fieldName === 'OR' || fieldName === 'AND') {
      queryBuilder[mode](
        new Brackets(builder => {
          whereOrValue.forEach(innerWhere =>
            documentWhereBuilder(tableName, fields, builder, innerWhere, scope, modes[fieldName])
          );
          return builder;
        })
      );
    } else if (operators.hasOwnProperty(fieldName)) {
      const innerScope = ['"data"', ...scope.slice(0).map(n => `'${n}'`)];
      const lastScopeItem = innerScope.pop();
      const column = `"${tableName}".${innerScope.join('->')}->>${lastScopeItem}`;
      const operator = operators[fieldName];
      if (!operator) {
        continue;
      }
      let value = whereOrValue;
      if (fieldName === 'contains') {
        value = `%${value}%`;
      }
      const key = Buffer.from(value).toString('hex');
      queryBuilder[mode](`${column} ${operator} :${key}`, { [key]: value });
    } else if (whereOrValue) {
      const field = fields.find(
        targetField =>
          targetField.name === fieldName &&
          targetField.parentFieldId === (scope[scope.length - 1] || null)
      );
      if (field && field.primeField) {
        const nextScope = [...scope, field.id];
        documentWhereBuilder(tableName, fields, queryBuilder, whereOrValue, nextScope, mode);
      }
    }
  }
};
