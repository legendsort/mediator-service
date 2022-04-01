/** @format */
const CloudinfoModel = require("../models/cloudInfoModel");
var {sendResponse} = require("./ControllerHepler");

const fs = require("fs");

const defaultUser = "mediator";
const defaultHost = "192.168.4.82"

const getFtpService = async (req) => {
  const ftpService = req.app.get('ftp-service');

  const username = req.body.username || defaultUser;
  const host = req.body.host || defaultHost;
  
  const cloudInfo = await CloudinfoModel.findOne({ username: username, host: host});
  if(typeof cloudInfos !== undefined && cloudInfo !== null) {
    await ftpService.loginServer(
      cloudInfo.url,
      cloudInfo.username,
      cloudInfo.password
    );
    return ftpService;
  }
  
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
      console.log(e)
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
      console.log(e)
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
      console.log(e)
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

      await ftpService.rename(srcPath, dstPath)
      return sendResponse(res, 200, true, "rename file succeed", {src: srcPath, dst: dstPath});
    } catch(e) {
      console.log(e)
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
      console.log(e)
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
      console.log(e)
      return sendResponse(res, 500, false, "upload file failed", e);
    }
  },

  /**
   * cloudInfoController.remove()
   */
  remove: async (req, res) => {
    try{
      const ftpService = await getFtpService(req);
      const path = req.body.path 
      await ftpService.remove(path)
      return sendResponse(res, 200, true, "remove file succeed", {src: srcPath, dst: dstPath});

    } catch(e) {
      console.log(e)
      return sendResponse(res, 500, false, "remove file failed", e);
    }
  },
};
