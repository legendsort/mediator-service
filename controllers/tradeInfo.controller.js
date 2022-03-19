/** @format */
var moment = require("moment")

var tradeInfoModel = require("../models/tradeInfo.model");

/**
 * tradeInfoController.js
 *
 * @description :: Server-side logic for managing tradeInfos.
 */
module.exports = {
  /**
   * tradeInfoController.create()
   */
  create: async (req, res) => {
    
    let [data, type, time] = [req.body.res, req.body.name, req.body.upTime]
    if(time === undefined) time = Date.now().toISOString

//     if(type === "cbr") {
//       time = Date.now().toISOString
//     }
// 
//     if(type === "forex") {
// 
//     }
// 
//     if(type === "boc") {
//       let upTime = new moment()
//       console.log(upTime.format('MMMM Do YYYY, h:mm:ss'))
//     }

    const newInfo = new tradeInfoModel ({
      type: type,
      data: data,
      upTime: time,
      isSync: false
    })

    newInfo.save(function (err, newInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when saving tradeInfo",
          error: err,
        });
      }

      return res.status(201).json(data);
    });
  },


 
};
