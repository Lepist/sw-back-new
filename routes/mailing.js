const express = require('express')
const passport = require('passport')
const controller = require('../controllers/mailing')
const router = express.Router()

router.get('/my', controller.getMyMailings)
router.get('/sortedMailings', controller.getMySortedMailings)
router.get('/fullDataOfMailing', controller.getFullDataOfMailing)
module.exports = router