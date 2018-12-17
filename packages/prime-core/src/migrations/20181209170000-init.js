var dbm;
var type;
var fs = require('fs');
var path = require('path');

exports.setup = function setup(options) {
  dbm = options.dbmigrate;
  type = dbm.datatype;
};

exports.up = function up(db, callback) {
  var filePath = path.join(__dirname + '/20181209170000-init-up.sql');
  fs.readFile(filePath, { encoding: 'utf-8' }, function(err,data){
    if (err) return console.log(err);
    db.runSql(data, function(err) {
      if (err) return console.log(err);
      callback();
    });
  });
};

exports.down = function down(db) {
  return Promise.all([
    db.dropTable('ContentEntry'),
    db.dropTable('ContentRelease'),
    db.dropTable('ContentType'),
    db.dropTable('ContentTypeField'),
    db.dropTable('Navigation'),
    db.dropTable('Session'),
    db.dropTable('Settings'),
    db.dropTable('User'),
  ]);
};
