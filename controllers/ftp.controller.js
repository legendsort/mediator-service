/** @format */
const CloudinfoModel = require("../models/cloudInfoModel");
const fs = require("fs");
/**
 * cloudInfoController.js
 *
 * @description :: Server-side logic for managing cloudInfos.
 */
module.exports = {
  /**
   * cloudInfoController.list()
   */
  list: async (req, res) => {
    try{
      const ftpService = req.app.get("ftp-service");
      const cloudInfo = await CloudinfoModel.findOne({ username: "mediator"});
      console.log(cloudInfo, typeof cloudInfo)
      if(typeof cloudInfos !== undefined && cloudInfo !== null) {
        await ftpService.loginServer(
          cloudInfo.url,
          cloudInfo.username,
          cloudInfo.password
        );
        return await ftpService.getList()
      }
    } catch(e) {
      console.log(e)
    }
  },

  /**
   * cloudInfoController.show()
   */
  copy: async (req, res) => {
    var cloudInfo = new CloudinfoModel({
      url: req.body.url,
      username: req.body.username,
      password: req.body.password,
      port: req.body.port,
    });

    cloudInfo.save(function (err, cloudInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when creating cloudInfo",
          error: err,
        });
      }

      return res.status(201).json(cloudInfo);
    });
  },

  /**
   * cloudInfoController.create()
   */
  move: async (req, res) => {},

  /**
   * cloudInfoController.update()
   */
  rename: async (req, res) => {},
  /**
   * cloudInfoController.update()
   */
  download: async (req, res) => {},

  /**
   * cloudInfoController.update()
   */
  upload: async (req, res) => {
    try {
      const uploaded_file = req.files.file;
      const uploadPath =
        req.app.get("public-dir") + "/ftp/upload/" + uploaded_file.name;
      let ftpService = req.app.get("ftp-service");
      await uploaded_file.mv(uploadPath);
      cloudInfos = await CloudinfoModel.findOne({ username: "mediator" });
      if (typeof cloudInfos !== undefined) {
        await ftpService.loginServer(
          cloudInfos.url,
          cloudInfos.username,
          cloudInfos.password,
        );
      }
      await ftpService.client.uploadFrom(uploadPath, req.files.file.name);
      fs.unlinkSync(uploadPath, {
        force: true,
      });
    } catch (error) {
      return res.json({ status: false });
    }
    return res.json({ status: true });
  },

  /**
   * cloudInfoController.remove()
   */
  remove: async (req, res) => {},
};
