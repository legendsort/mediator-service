/** @format */
var configModel = require("../models/config.model");

/**
 * .js
 *
 * @description :: Server-side logic for managing config.
 */
var {sendResponse} = require("./ControllerHepler");


module.exports = {

  /**
   * config.fetch()
   * fetch config
   * request parm: [site, tag]
   * response param: [config]
   */
  fetch: async (req, res) => {
    const [site, tag] = [req.query.site, req.query.tag];
    configModel.findOne({site: site, tag: tag}, function (err, config) {
      if (err) return sendResponse(res, 500, false, "Error when fetching config.", err);
      if(config === null) return sendResponse(res, 202, false, "No such site and tag", tag);
      return sendResponse(res, 200, true, "Success when fetching config.\n", config)
    });
  },

};
