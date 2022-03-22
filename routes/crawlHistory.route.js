/** @format */

var express = require("express");
var router = express.Router();
var crawlHistoryController = require("../controllers/crawlHistory.controller");

router.post("/create", crawlHistoryController.create);
router.get ("/fetch", crawlHistoryController.fetch);
router.post("/fetch-succed", crawlHistoryController.fetchSucced);
module.exports = router;
