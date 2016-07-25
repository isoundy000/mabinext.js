var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var url = "mongodb://localhost/myexp";

// var options = {
//     user: "test",
//     pass: "test",
//     auth: true
// }
//mongoose.connect(url, options);
mongoose.connect(url);

var db = mongoose.connection;
autoIncrement.initialize(db);

db.on('error', console.error.bind(console, 'mongodb connection error:'));

module.exports = db;