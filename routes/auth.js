const express = require('express')
const passport = require('passport')
const controller = require('../controllers/auth')
const router = express.Router()

router.post('/login', controller.login)
router.get('/refresh', controller.refresh)
router.get('/logout', controller.logout)

module.exports = router