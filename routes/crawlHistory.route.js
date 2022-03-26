/** @format */

var express = require("express");
var router = express.Router();
var crawlHistoryController = require("../controllers/crawlHistory.controller");

router.post("/create", crawlHistoryController.create);
router.get ("/fetchAll", crawlHistoryController.fetchAll);
router.get ("/fetch", crawlHistoryController.fetch);

module.exports = router;
