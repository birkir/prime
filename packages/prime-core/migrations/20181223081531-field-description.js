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
  await db.addColumn('ContentTypeField', 'description', { type: 'string', length: 255 });
  return null;
};

exports.down = async (db) => {
  await db.removeColumn('ContentTypeField', 'description');
  return null;
};

exports._meta = {
  "version": 1
};
