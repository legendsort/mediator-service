var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var tradeInfoSchema = new Schema({
	'type' : String,
	'data' : Object,
	'upTime': String,
	'crawlTime': Date,
	'isSync': Boolean
});

module.exports = mongoose.model('tradeInfo', tradeInfoSchema);
