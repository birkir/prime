import { Sequelize } from 'sequelize-typescript';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL || DATABASE_URL === '') {
  throw new Error('DATABASE_URL not set');
}

export const sequelize = new Sequelize({
  dialect: 'postgres',
  modelPaths: [`${__dirname}/models`],
  logging: false,
  url: DATABASE_URL,
});