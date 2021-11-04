var mysql=require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'nodejs',
    password: 'tjwjd5795',
    database: 'opentutorials',
    port: '3307'
  });
  db.connect();
  module.exports = db;