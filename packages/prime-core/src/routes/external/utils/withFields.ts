import { sequelize } from '../../../sequelize';

export const withField = (fieldName, value) => {
  const col = fieldName.split('.').map(n => `"${n}"`).join('.');

  if (value == null || value === undefined) {
    return '';
  }

  if (value === true || value === false) {
    return `AND ${col} = ${value ? 'true' : 'false'} `;
  }

  return `AND ${col} = ${sequelize.escape(value)} `;
};
