/** @format */

var express = require('express')
var router = express.Router()
var searchController = require('../controllers/paper.search.controller')

router.get('/', searchController.search)
router.post('/', searchController.search)

module.exports = router
