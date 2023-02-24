const express = require('express')
const passport = require('passport')
const controller = require('../controllers/analytics')
const router = express.Router()

router.get('/user=:user', passport.authenticate('jwt', {session: false}), controller.getAllData)

module.exports = router