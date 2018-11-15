import { Sequelize } from 'sequelize-typescript';

let config = {} as any;

if (process.env.DATABASE_URL) {
  config.url = process.env.DATABASE_URL;
} else {
  config.database = 'prime-sq';
  config.username = 'birkir';
  config.password = '';
}

export const sequelize = new Sequelize({
  dialect: 'postgres',
  modelPaths: [`${__dirname}/models`],
  logging: true,
  ...config,
});
