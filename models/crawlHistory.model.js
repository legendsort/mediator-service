var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var crawlHistorySchema = new Schema({
	type : String,
	status: String,
	message: String,
	time: String,
	isSync: Boolean
});

module.exports = mongoose.model('crawlHistory', crawlHistorySchema);
