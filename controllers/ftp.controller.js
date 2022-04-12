/** @format */
const CloudinfoModel = require("../models/cloudInfoModel");
var {sendResponse} = require("./ControllerHepler");

const fs = require("fs");
const path = require("path");

const getFtpService = async (req) => {
  const ftpService = req.app.get('ftp-service');

  const username = req.body.username || process.env.FTP_USER;
  const host = req.body.host || process.env.FTP_SERVER;
  const cloudInfo = await CloudinfoModel.findOne({ username: username, host: host});
  if(typeof cloudInfos !== undefined && cloudInfo !== null) {
    await ftpService.loginServer(
      cloudInfo.url,
      cloudInfo.username,
      cloudInfo.password
    );
    return ftpService;
  }
  throw "cannot login to ftp server";
}

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
      const ftpService = await getFtpService(req);
      const path = req.query.path;
      const ans = await ftpService.getList(path);
      return sendResponse(res, 200, true, "get list succeed", ans);
    } catch(e) {
      console.log("Get list error!\n", e)
      return sendResponse(res, 500, false, "get list failed", e);

    }
  },

  /**
   * cloudInfoController.copy()
   */
  copy: async (req, res) => {
    try {
      const ftpService = await getFtpService(req);
      const srcPath = req.body.srcPath;
      const dstPath = req.body.dstPath;
      const tmpPath = `${req.app.get("public-dir")}\\ftp\\upload\\${srcPath}`;

      await ftpService.download(srcPath, tmpPath)
      await ftpService.upload(tmpPath, dstPath)
      fs.unlinkSync(tmpPath, {
        force: true,
      });
      return sendResponse(res, 200, true, "copy file succeed", {src: srcPath, dst: dstPath})
    } catch(e) {
      console.log("copy file error!\n", e)
      return sendResponse(res, 500, false, "copy file failed", e);
    }
  },

  /**
   * cloudInfoController.move()
   */
  move: async (req, res) => {
    try {
      const ftpService = await getFtpService(req);
      const srcPath = req.body.srcPath;
      const dstPath = req.body.dstPath;
      const tmpPath = `${req.app.get("public-dir")}\\ftp\\upload\\${srcPath}`;

      await ftpService.download(srcPath, tmpPath)
      await ftpService.upload(tmpPath, dstPath)
      fs.unlinkSync(tmpPath, {
        force: true,
      });
      console.log(srcPath)
      await ftpService.remove(srcPath)
      return sendResponse(res, 200, true, "copy file succeed", {src: srcPath, dst: dstPath})
    } catch(e) {
      console.log("move file error!\n", e)
      return sendResponse(res, 500, false, "copy file failed", e);
    }
  },

  /**
   * cloudInfoController.rename()
   */
  rename: async (req, res) => {
    try{
      const ftpService = await getFtpService(req);
      const srcPath = req.body.srcPath;
      const dstPath = req.body.dstPath;
      const dir = path.dirname(srcPath)
      await ftpService.rename(srcPath, dstPath)
      const list = await ftpService.getList(dir)
      return sendResponse(res, 200, true, "rename file succeed", list);
    } catch(e) {
      console.log("rename file error!\n", e)
      return sendResponse(res, 500, false, "rename file failed", e);
    }

  },
  /**
   * cloudInfoController.update()
   */
  download: async (req, res) => {
    try {
      const ftpService = await getFtpService(req);
      const srcPath = req.body.srcPath;
      const dstPath = `${req.app.get("public-dir")}\\ftp\\upload\\${req.body.dstPath}`;
      await ftpService.download(srcPath, dstPath)
      return sendResponse(res, 200, true, "download file succeed", {src: srcPath, dst: dstPath});

    } catch(e) {
      console.log("download file error!\n", e)
      return sendResponse(res, 500, false, "download file failed", e);
    }
  },

  /**
   * cloudInfoController.update()
   */
  upload: async (req, res) => {
    try {
      const ftpService = await getFtpService(req);
      const srcPath = req.body.srcPath;
      const uploaded_file = req.files.file;
      const uploadPath = req.app.get("public-dir") + "/ftp/upload/" + uploaded_file.name;
      await uploaded_file.mv(uploadPath);
      await ftpService.upload(uploadPath, srcPath)
      
      fs.unlinkSync(uploadPath, {
        force: true,
      });
      return sendResponse(res, 200, true, "upload file succeed", {uploadPath: uploadPath, name: req.files.file.name});
    } catch (e) {
      console.log("upload file error!\n", e)
      return sendResponse(res, 500, false, "upload file failed", e);
    }
  },

  /**
   * cloudInfoController.remove()
   */
  remove: async (req, res) => {
    try{
      const ftpService = await getFtpService(req);
      const items = req.body.path 
      if(items.length > 0) {
        for(const item of items) {
          await ftpService.remove(item)
        }
        const list = await ftpService.getList(path.dirname(items[0].path))
        return sendResponse(res, 200, true, "remove file succeed", list);
      }
    } catch(e) {
      console.log("remove file error!\n", e)
      return sendResponse(res, 500, false, "remove file failed", e);
    }
  },
};
