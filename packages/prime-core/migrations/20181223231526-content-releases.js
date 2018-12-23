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
  await db.renameColumn('ContentRelease', 'publishAt', 'scheduledAt');
  await db.addColumn('ContentRelease', 'publishedAt', { type: 'timestamp' });
  await db.runSql('ALTER TABLE "ContentRelease" ADD COLUMN "publishedBy" uuid;');
  return null;
};

exports.down = async (db) => {
  await db.renameColumn('ContentRelease', 'scheduledAt', 'publishAt');
  await db.removeColumn('ContentRelease', 'publishedAt');
  await db.removeColumn('ContentRelease', 'publishedBy');
  return null;
};

exports._meta = {
  "version": 1
};
