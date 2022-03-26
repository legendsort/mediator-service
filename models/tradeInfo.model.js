var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var Schema   = mongoose.Schema;

var tradeInfoSchema = new Schema({
	'type' : String,
	'data' : Object,
	'upTime': Date,
	'isSync': Boolean
});

tradeInfoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('tradeInfo', tradeInfoSchema);
