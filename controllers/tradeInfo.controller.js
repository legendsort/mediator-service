/** @format */
var tradeInfoModel = require("../models/tradeInfo.model");

/**
 * tradeInfoController.js
 *
 * @description :: Server-side logic for managing tradeInfos.
 */
var {sendResponse} = require("./ControllerHepler");


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
      if (err) return sendResponse(res, 500, false, "Eror when saving tradeInfo.", err)
      return sendResponse(res, 200, true, "creating tradeInfo succeed", newInfo)
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
      if (err) return sendResponse(res, 500, false, "Error when fetching tradeInfo whose isSync is false.", err)
      return sendResponse(res, 200, true, "Success when fetching tradeinfo whose isSync is false.", tradeInfo)
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
    if(id === undefined) 
      return sendResponse(res, false, "No id array. Please send id array to remove", "No id array")

    tradeInfoModel.updateMany({_id: {$in: id}}, {isSync: false}, (err, tradeInfo) => {
      if (err) return sendResponse(res, 500, false, "Error when signing tradeIfno to make isSync true.", err)
      return sendResponse(res, 200, true, "Success when signing tradeInfo to make isSync true.", tradeInfo)
    })
    
  }



 
};
