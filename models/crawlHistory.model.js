var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var crawlHistorySchema = new Schema({
	type : String,
	status: String,
	message: String,
	time: Date,
});

module.exports = mongoose.model('crawlHistory', crawlHistorySchema);
