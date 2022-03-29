/** @format */

var express = require("express");
var router = express.Router();
var connectionController = require("../controllers/connect.controller");

router.post("/browser", connectionController.browser);
module.exports = router;
