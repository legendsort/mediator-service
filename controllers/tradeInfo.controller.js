/** @format */
var tradeInfoModel = require("../models/tradeInfo.model");

/**
 * tradeInfoController.js
 *
 * @description :: Server-side logic for managing tradeInfos.
 */


const getHourMinute = time => {
  const data = time.split((/[: ]/))
  return [parseInt(data[0]), parseInt(data[1])]
}

module.exports = {
  /**
   * tradeInfoController.create()
   */
  create: async (req, res) => {
    
    let [data, type, time] = [req.body.res, req.body.name, req.body.time]
    
    const newInfo = new tradeInfoModel ({
      type: type,
      data: data,
      upTime: time,
      isSync: false
    })

    newInfo.save(function (err, newInfo) {
      if (err) {
        return res.status(500).json({
          response_code: false,
          message: "Error when saving tradeInfo",
          data: err
        });
      }

      return res.status(201).json({
        response_code: true,
        message: "creating tradeInfo succeed",
        data: newInfo,
      });
    })
  },
  /**
   * tradeInfoController.create()
   * fetch data whose isSync is false
   * request parm: []
   * response param: [status, tradeInfo]
   */
  fetch: async (req, res) => {

    tradeInfoModel.find({ isSync: false }, function (err, tradeInfo) {
      if (err) {
        return res.status(500).json({
          response_code: false,
          message: "Error when fetching tradeInfo whose isSync is false.",
          data: err
        });
      }
      return res.json({
        response_code: true,
        message: "Success when fetching tradeinfo whose isSync is false.",
        data: tradeInfo
      });
    });
  },

  /**
   * tradeInfoController.fetchsucceed()
   * success so that need to make sign
   * request param: [id: array]
   * response param: [status]
   */
  fetchsucceed: async (req, res) => {
    const id = req.body.id
    if(id === undefined) {
      return res.status(500).json({
        response_code: false,
        message: "No id array. Please send id array to remove",
        data: "No id array"
      })
    }
    tradeInfoModel.updateMany({_id: {$in: id}}, {isSync: false}, (err, tradeInfo) => {
      if(err) {
        return res.status(500).json({
          response_code: false,
          message: "Error when signing tradeIfno to make isSync true.",
          data: err
        })
      }
      return res.json({
        response_code: true,
        message: "Success when signing tradeInfo to make isSync true.",
        data: tradeInfo
      });
    })
    
  }



 
};
