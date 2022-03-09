/** @format */

var express = require("express");
var router = express.Router();
const CloudinfoModel = require("../models/cloudInfoModel");

/* GET home page. */
router.get("/test", async (req, res, next) => {
  let ftpService = req.app.get("ftp-service");
  try {
    cloudInfos = await CloudinfoModel.findOne({ username: "mediator" });
    if (typeof cloudInfos !== undefined) {
      await ftpService.loginServer(
        cloudInfos.url,
        cloudInfos.username,
        cloudInfos.password,
      );
    }
  } catch (error) {}
  res.json(await ftpService.getList());
});

module.exports = router;
