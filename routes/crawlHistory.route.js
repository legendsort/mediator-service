/** @format */

var express = require("express");
var router = express.Router();
var crawlHitoryController = require("../controllers/crawlHistory.controller");

router.post("/create", crawlHitoryController.create);
router.get ("/fetch", crawlHitoryController.fetch);
router.post("/fetch-succed", crawlHitoryController.fetchSucced);
module.exports = router;
