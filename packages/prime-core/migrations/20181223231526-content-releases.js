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
  await db.addColumn('ContentRelease', 'description', { type: 'string', length: 255 });
  await db.runSql('ALTER TABLE "ContentRelease" ADD COLUMN "publishedBy" uuid;');
  await db.runSql('ALTER TABLE "ContentEntry" DROP CONSTRAINT IF EXISTS "ContentEntry_contentReleaseId_fkey"');
  await db.runSql('ALTER TABLE "ContentEntry" ADD CONSTRAINT "ContentEntry_contentReleaseId_fkey" FOREIGN KEY ("contentReleaseId") REFERENCES "ContentRelease"(id) ON UPDATE SET NULL ON DELETE SET NULL');
  return null;
};

exports.down = async (db) => {
  await db.renameColumn('ContentRelease', 'scheduledAt', 'publishAt');
  await db.removeColumn('ContentRelease', 'description');
  await db.removeColumn('ContentRelease', 'publishedAt');
  await db.removeColumn('ContentRelease', 'publishedBy');
  await db.runSql('ALTER TABLE "ContentEntry" DROP CONSTRAINT IF EXISTS "ContentEntry_contentReleaseId_fkey"');
  await db.runSql('ALTER TABLE "ContentEntry" ADD CONSTRAINT "ContentEntry_contentReleaseId_fkey" FOREIGN KEY ("contentReleaseId") REFERENCES "ContentRelease"(id) ON UPDATE CASCADE')
  return null;
};

exports._meta = {
  "version": 1
};
