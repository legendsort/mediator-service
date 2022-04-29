/** @format */
const fs = require("fs");
/**
 * cloudInfoController.js
 *
 * @description :: Server-side logic for managing cloudInfos.
 */
module.exports = {
  /**
   *
   */
  browser: async (req, res) => {
    try {
      let identifier = req.user.identifier;
      let browser_srv = req.app.get("browser-service");
      let response_code = browser_srv.makeBrowser(identifier);
      return res.json({
        response_code: response_code ? true : false,
        message: "Sccuessfully",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        response_code: false,
        message: "Server has error",
      });
    }
  },

  /**
   *
   */
  copy: async (req, res) => {},

  /**
   *
   */
  move: async (req, res) => {},

  /**
   *
   */
  rename: async (req, res) => {},
  /**
   *
   */
  download: async (req, res) => {},

  /**
   *
   */
  upload: async (req, res) => {},

  /**
   *
   */
  remove: async (req, res) => {},
};
