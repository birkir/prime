import { Op } from 'sequelize';

const logicalOperators = {
  OR: Op.or,
  AND: Op.and
};

const compareOperators = {
  eq: Op.eq,
  ne: Op.ne,
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte
};

function formatCompareOperators(obj): Object {
  return Object.entries(obj).reduce(
    (acc, [key, val]: [string, object]) => {
      if (compareOperators[key]) {
        acc[compareOperators[key]] = val;
      } else {
        acc[key] = val;
      }

      return acc;
    },
    {}
  );
}

export function processWhereQuery(obj, fields): Object {
  return Object.entries(obj).reduce(
    (acc, [key, val]: [string, object]) => {
      if (logicalOperators[key]) {
        const value = val instanceof Array ? val : [val];
        acc[logicalOperators[key]] = value.map(processWhereQuery);
      } else {
        const field = fields.find(f => f.name === key);
        if (field) {
          key = field.id;
        }
        acc.data = {
          ...(acc.data || {}),
          [key]: {
            ...((acc.data && acc.data[key]) || {}),
            ...formatCompareOperators(val)
          }
        };
      }

      return acc;
    },
    { data: {} }
  );
}
