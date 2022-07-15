/** @format */
var crawlHistoryModel = require('../models/crawlHistory.model')

/**
 * crawlHistoryController.js
 *
 * @description :: Server-side logic for managing crawl history.
 */

var {sendResponse} = require('./ControllerHepler')

module.exports = {
  /**
   * crawlHistoryController.create()
   */
  create: async (req, res) => {
    const history = req.body.history
    const newHistory = new crawlHistoryModel(history)

    newHistory.save(function (err, newHistory) {
      if (err) return sendResponse(res, 500, false, 'Error when saving crawl history.', err)
      return sendResponse(res, 200, true, 'Success when saving crawl history.', newHistory)
    })
  },
  /**
   * crawlHistoryController.fetchAll()
   * fetch all data
   * request parm: []
   * response param: [status, crawlHistory]
   */
  fetchAll: async (req, res) => {
    crawlHistoryModel.find({}, function (err, crawlHistory) {
      if (err) return sendResponse(res, 500, false, 'Error when fetching all crawl history', err)
      return sendResponse(res, 200, true, 'Success when fetching all crawl history', crawlHistory)
    })
  },

  /**
   * crawlHistoryController.fetch()
   * fetch data
   * request parm: [pageSize, pageNumber]
   * response param: [data, pageNumber, pageSize, totalPages]
   */
  fetch: async (req, res) => {
    const {pageSize, pageNumber, id, message, status, start_time, end_time} = req.query
    if (pageSize === undefined) pageSize = 10
    if (pageNumber === undefined) pageNumber = 0
    let query = {}
    if (status) query.status = {$regex: status, $options: 'i'}
    if (message) query.message = {$regex: message, $options: 'i'}
    if (start_time && end_time)
      query.time = {
        $gte: start_time,
        $lt: end_time,
      }
    const pageOptions = {
      page: pageNumber,
      limit: pageSize,
      sort: {time: -1},
    }

    crawlHistoryModel.paginate(query, pageOptions, (err, result) => {
      if (err) return sendResponse(res, 500, false, 'Error when paginating crawl history', err)
      const data = {
        data: result.docs,
        pageNumber: pageNumber,
        pageSize: pageSize,
        totalPages: result.totalPages,
      }
      return sendResponse(res, 200, true, 'Success paginating', data, true)
    })
  },
}
