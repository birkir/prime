import { createConnection } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { AccessToken } from '../entities/AccessToken';
import { Document } from '../entities/Document';
import { Release } from '../entities/Release';
import { Schema } from '../entities/Schema';
import { SchemaField } from '../entities/SchemaField';
import { Settings } from '../entities/Settings';
import { Webhook } from '../entities/Webhook';
import { WebhookCall } from '../entities/WebhookCall';

export const connect = (url = process.env.DATABASE_URL) =>
  createConnection({
    type: 'postgres',
    url,
    entities: [
      ...require('@accounts/typeorm').entities,
      AccessToken,
      Document,
      Release,
      Schema,
      SchemaField,
      Settings,
      Webhook,
      WebhookCall,
    ],
    synchronize: true,
    logger: 'debug',
  }).then(connection => {
    const driver = connection.driver as PostgresDriver;

    // Fixes postgres timezone bug
    driver.postgres.defaults.parseInputDatesAsUTC = true;
    driver.postgres.types.setTypeParser(1114, (str: any) => new Date(str + 'Z'));

    return connection;
  });
