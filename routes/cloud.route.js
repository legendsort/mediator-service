/** @format */

var express = require("express");
var router = express.Router();
var ftpController = require("../controllers/ftp.controller");

router.get("/list", ftpController.list);
router.post("/rename", ftpController.rename);
router.post("/copy", ftpController.copy);
router.post("/move", ftpController.move);
router.post("/upload", ftpController.upload);
router.post("/download", ftpController.download);
router.delete("/remove", ftpController.remove);

module.exports = router;
