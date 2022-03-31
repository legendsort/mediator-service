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
      user_id = req.user.user_id;
      let browser_srv = req.app.get("browser-service");
      let response_code = browser_srv.makeBrowser(user_id);
      return res.json({
        response_code: response_code,
        message: "Sccuessfully",
      });
    } catch (error) {
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
