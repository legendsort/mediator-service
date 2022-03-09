var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var cloudInfoSchema = new Schema({
	'url' : String,
	'username' : String,
	'password' : String,
	'port' : Number
});

module.exports = mongoose.model('cloudInfo', cloudInfoSchema);
