/** @format */
var moment = require("moment")

var crawlHistoryModel = require("../models/crawlHistory.model");

/**
 * crawlHistoryController.js
 *
 * @description :: Server-side logic for managing crawl history.
 */


module.exports = {
  /**
   * crawlHistoryController.create()
   */
  create: async (req, res) => {
    const history = req.body.history
    const newHistory = new crawlHistoryModel (history)

    newHistory.save(function (err, newHistory) {
      if (err) {
        return res.status(500).json({
          response_code: false,
          message: "Error when saving crawl history.",
          data: err
        });
      }

      return res.status(201).json({
        resposne_code: true,
        message: "Success when saving crawl history.",
        data: newHistory
      });
    });
  },

  /**
   * crawlHistoryController.create()
   * fetch data whose isSync is false
   * request parm: []
   * response param: [status, crawlHistory]
   */
  fetch: async (req, res) => {
    crawlHistoryModel.find({ isSync: false }, function (err, crawlHistory) {
      if (err) {
        return res.status(500).json({
          resposne_code: false,
          message: "Error when fetching crawl history whose isSync is false.",
          error: err,
        });
      }
      return res.json({
        resposne_code: true,
        message: "Success when fetching crawl history whose isSync is false.",
        data: crawlHistory
      });
    });
  },

  /**
   * crawlHistoryController.fetchSucced()
   * success so that need to make sign
   * request param: [id: array]
   * response param: [status]
   */
  fetchSucced: async (req, res) => {
    const id = req.body.id
    
    crawlHistoryModel.updateMany({_id: {$in: id}}, {isSync: true}, (err, crawlHistory) => {
      if(err) {
        return res.status(500).json({
          resposne_code: false,
          message: "Error when signing crawl history to make isSync true.",
          error: err
        })
      }
      return res.json({
        resposne_code: true,
        message: "Success when signing crawl history to make isSync true.",
        data: crawlHistory
      })
    })
  }
};
