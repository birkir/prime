import { Sequelize } from 'sequelize';

interface IAclOptions {
  prefix: string;
  schema?: object;
  defaultSchema?: object;
}

const buckets = ['Meta', 'Parents', 'Permissions', 'Resources', 'Roles', 'Users'];

export const setup = (db: Sequelize, options: IAclOptions) => {
  const {
    prefix,
    schema = {},
    defaultSchema = {
      key: { type: db.Sequelize.STRING, primaryKey: true },
      value: { type: db.Sequelize.JSONB },
    },
  } = options;

  buckets.forEach((table: string) => {
    const name = `${prefix}${table}`;
    if (!db.models[name]) {
      db.define(name, schema[table] || defaultSchema).sync();
    }
  });

  return db;
};

export const clean = (db: Sequelize, options: IAclOptions) => null;
