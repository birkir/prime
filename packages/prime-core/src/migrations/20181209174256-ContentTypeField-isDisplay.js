'use strict';

exports.up = function(db) {
  return db.addColumn('ContentTypeField', 'isDisplay', {
    type: 'boolean'
  });
};

exports.down = function(db) {
  return db.removeColumn('ContentTypeField', 'isDisplay');
};

exports._meta = {
  version: 1
};
