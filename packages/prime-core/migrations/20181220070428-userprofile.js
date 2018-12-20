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
  await db.addColumn('User', 'displayName', { type: 'string', length: 255 });
  await db.addColumn('User', 'avatarUrl', { type: 'string', length: 255 });
  await db.addColumn('User', 'lastPasswordChange', { type: 'timestamp', defaultValue: new String('now()') });
  return null;
};

exports.down = async (db) => {
  await db.removeColumn('User', 'displayName');
  await db.removeColumn('User', 'avatarUrl');
  await db.removeColumn('User', 'lastPasswordChange');
  return null;
};

exports._meta = {
  "version": 1
};
