import { Sequelize } from 'sequelize-typescript';

const { DATABASE_URL, HEROKU_APP_NAME } = process.env;
const { Op } = Sequelize;

if (!DATABASE_URL || DATABASE_URL === '') {
  throw new Error('DATABASE_URL not set');
}

const ssl = String(DATABASE_URL).indexOf('ssl=true') >= 0 || (HEROKU_APP_NAME && String(DATABASE_URL).indexOf('amazonaws.com') >= 0);

if (HEROKU_APP_NAME) {
  console.log('HEROKU_APP_NAME =', HEROKU_APP_NAME);
  console.log('DATABASE_URL =', DATABASE_URL);
  console.log('SSL = ', String(ssl));
}

const options = {
  dialect: 'postgres',
  modelPaths: [`${__dirname}/models`],
  operatorsAliases: Op as any,
  logging: false,
  url: DATABASE_URL,
  ssl,
  dialectOptions: {
    ssl,
  },
};

export const sequelize = new Sequelize(options);
