/** @format */
const fs = require('fs')
const axios = require('axios')
require('dotenv').config()

/**
 * connectController.js
 *
 * @description :: Server-side logic for managing connect.
 */
module.exports = {
  /**
   *
   */
  search: async (req, res) => {
    try {
      let response_code = true
      const search_url = process.env.PAPER_SEARCH_API

      var data = JSON.stringify({
        q: req.body['keyword'],
        page: req.body['page'] ?? 1,
        limit: req.body['limit'] ?? 10,
        offset: req.body['offset'] ?? 10,
      })

      var config = {
        method: 'post',
        url: `${search_url}/search/works`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAPER_SEARCH_API_KEY}`,
        },
        data: data,
      }
      let results = await axios(config)
      return res.json({
        response_code: response_code ? true : false,
        message: response_code ? 'Sccuessfully' : 'Failed create browser',
        data: results.data,
      })
    } catch (error) {
      console.log(error)
      return res.json({
        response_code: false,
        message: 'Server has error',
        data: [],
      })
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
}
