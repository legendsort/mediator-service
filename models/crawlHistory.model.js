var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var Schema   = mongoose.Schema;

var crawlHistorySchema = new Schema({
	type : String,
	status: String,
	message: String,
	time: Date,
});

crawlHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('crawlHistory', crawlHistorySchema);
