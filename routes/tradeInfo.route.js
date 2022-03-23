/** @format */

var express = require("express");
var router = express.Router();
var tradeInfoController = require("../controllers/tradeInfo.controller");

router.post("/create", tradeInfoController.create);
router.get ("/fetch", tradeInfoController.fetch);
router.post("/fetch-succeed", tradeInfoController.fetchsucceed);
module.exports = router;
