/** @format */
var configModel = require("../models/config.model");

/**
 * .js
 *
 * @description :: Server-side logic for managing config.
 */
var { sendResponse } = require("./ControllerHepler");

module.exports = {
  /**
   * config.fetch()
   * fetch config
   * request parm: [site, tag]
   * response param: [config]
   */
  fetch: async (req, res) => {
    const [site, tag] = [req.query.site, req.query.tag];
    if(site === 'all') {
      configModel.find({}, function (err, config) {
        if (err) return sendResponse(res, 500, false, "Error when fetching config.", err);
        if(config === null) return sendResponse(res, 202, false, "No such site and tag", tag);
        return sendResponse(res, 200, true, "Success when fetching config.\n", config)
      });
    }
    else configModel.findOne({site: site, tag: tag}, function (err, config) {
      if (err) return sendResponse(res, 500, false, "Error when fetching config.", err);
      if(config === null) return sendResponse(res, 202, false, "No such site and tag", tag);
      return sendResponse(res, 200, true, "Success when fetching config.\n", config)
    });
  },

  /**
   * config.create()
   * create config
   * request parm: [config]
   * response param: [config]
   */
  create: async (req, res) => {
    const config = req.body;
    const newConfig = new configModel(config);
    console.warn(config);
    newConfig.save((err, newConfig) => {
      if (err)
        return sendResponse(
          res,
          500,
          false,
          "Error when creating config.",
          err,
        );
      return sendResponse(
        res,
        200,
        true,
        "Success when creating config.",
        newConfig,
      );
    });
  },

  /**
   * config.delete()
   * delete config
   * request parm: [site, tag]
   * response param: [config]
   */
  delete: async (req, res) => {
    const site = req.body.site;
    const tag = req.body.tag;
    configModel.remove({ site: site, tag: tag }, (err, config) => {
      if (err)
        return sendResponse(
          res,
          500,
          false,
          "Error when deleting config.",
          err,
        );
      if (config === null)
        return sendResponse(res, 400, false, "No such config.", err);
      return sendResponse(
        res,
        200,
        true,
        "Success when deleting config.",
        config,
      );
    });
  },

  /**
   * config.update()
   * update config
   * request parm: [id, config]
   * response param: [config]
   */
  update: async (req, res) => {
    const [id, config] = [req.body.id, req.body.config];
    console.error(config);
    configModel.updateOne({ _id: id }, config, (err, config) => {
      if (err)
        return sendResponse(
          res,
          500,
          false,
          "Error when updating config.",
          err,
        );
      return sendResponse(
        res,
        200,
        true,
        "Success when updating config .",
        config,
      );
    });
  },
};
