/** @format */

var CloudinfoModel = require("../models/cloudInfoModel.js");

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
    CloudinfoModel.find(function (err, cloudInfos) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting cloudInfo.",
          error: err,
        });
      }

      return res.json(cloudInfos);
    });
  },

  /**
   * cloudInfoController.show()
   */
  show: async (req, res) => {
    var id = req.params.id;

    CloudinfoModel.findOne({ _id: id }, function (err, cloudInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting cloudInfo.",
          error: err,
        });
      }

      if (!cloudInfo) {
        return res.status(404).json({
          message: "No such cloudInfo",
        });
      }

      return res.json(cloudInfo);
    });
  },

  /**
   * cloudInfoController.create()
   */
  create: async (req, res) => {
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
   * cloudInfoController.update()
   */
  update: async (req, res) => {
    var id = req.params.id;

    CloudinfoModel.findOne({ _id: id }, function (err, cloudInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting cloudInfo",
          error: err,
        });
      }

      if (!cloudInfo) {
        return res.status(404).json({
          message: "No such cloudInfo",
        });
      }

      cloudInfo.url = req.body.url ? req.body.url : cloudInfo.url;
      cloudInfo.username = req.body.username
        ? req.body.username
        : cloudInfo.username;
      cloudInfo.password = req.body.password
        ? req.body.password
        : cloudInfo.password;
      cloudInfo.port = req.body.port ? req.body.port : cloudInfo.port;

      cloudInfo.save(function (err, cloudInfo) {
        if (err) {
          return res.status(500).json({
            message: "Error when updating cloudInfo.",
            error: err,
          });
        }

        return res.json(cloudInfo);
      });
    });
  },

  /**
   * cloudInfoController.remove()
   */
  remove: async (req, res) => {
    var id = req.params.id;

    CloudinfoModel.findByIdAndRemove(id, function (err, cloudInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when deleting the cloudInfo.",
          error: err,
        });
      }

      return res.status(204).json();
    });
  },
};
