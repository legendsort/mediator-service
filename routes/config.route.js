/** @format */

var express = require("express");
var router = express.Router();
var configController = require("../controllers/config.controller");

router.get("/fetch", configController.fetch);
module.exports = router;
