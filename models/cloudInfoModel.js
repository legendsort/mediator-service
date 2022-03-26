/** @format */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var cloudInfoSchema = new Schema({
  url: String,
  type: String,
  data: String,
  real_date_time: Number,
  is_sync: Boolean,
});

module.exports = mongoose.model("cloudInfo", cloudInfoSchema);
