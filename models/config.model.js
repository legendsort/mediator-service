/** @format */

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var configSchema = new Schema({
  site: String,
  tag: String,
  config: Object
});

module.exports = mongoose.model("config", configSchema);
