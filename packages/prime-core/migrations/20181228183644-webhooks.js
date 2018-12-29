'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async (db) => {
  await db.runSql(`
    CREATE TABLE "Webhook" (
      id uuid NOT NULL,
      name character varying(255),
      url character varying(255),
      method character varying(255) DEFAULT 'POST'::character varying,
      options jsonb,
      "userId" uuid,
      "createdAt" timestamp with time zone,
      "updatedAt" timestamp with time zone,
      "deletedAt" timestamp with time zone
    );
  `);
  await db.runSql(`
    CREATE TABLE "WebhookCall" (
      id uuid NOT NULL,
      "webhookId" uuid NOT NULL,
      status integer,
      success boolean,
      request jsonb,
      response jsonb,
      "executedAt" timestamp with time zone
    )
  `);
  await db.runSql(`
    ALTER TABLE ONLY "Webhook"
      ADD CONSTRAINT "Webhook_pkey" PRIMARY KEY (id);

    ALTER TABLE ONLY "Webhook"
      ADD CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE SET NULL ON DELETE SET NULL;

    ALTER TABLE ONLY "WebhookCall"
      ADD CONSTRAINT "WebhookCall_pkey" PRIMARY KEY (id);

    ALTER TABLE ONLY "WebhookCall"
      ADD CONSTRAINT "WebhookCall_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"(id) ON UPDATE CASCADE;
  `);
  return null;
};

exports.down = async (db) => {
  await db.dropTable('WebhookCall');
  await db.dropTable('Webhook');
  return null;
};

exports._meta = {
  "version": 1
};
