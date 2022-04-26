/** @format */

var express = require("express");
var router = express.Router();
var configController = require("../controllers/config.controller");

router.get("/fetch", configController.fetch);
router.post("/create", configController.create);
router.post("/update", configController.update);
router.post("/delete", configController.delete);

module.exports = router;
