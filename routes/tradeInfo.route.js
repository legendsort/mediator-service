/** @format */

var express = require("express");
var router = express.Router();
var tradeInfoController = require("../controllers/tradeInfo.controller");

router.post("/create", tradeInfoController.create);

module.exports = router;
