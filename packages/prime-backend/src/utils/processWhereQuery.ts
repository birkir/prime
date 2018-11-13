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
  return Object.entries(obj).reduce((acc, [key, val]: [string, any]) => {
    if (compareOperators[key]) {
      acc[compareOperators[key]] = val;
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
}

export function processWhereQuery(obj): Object {
  return Object.entries(obj).reduce(
    (acc, [key, val]: [string, any]) => {
      if (logicalOperators[key]) {
        const value = val instanceof Array ? val : [val];
        acc[logicalOperators[key]] = value.map(processWhereQuery);
      } else {
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
