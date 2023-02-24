const express = require('express')
const passport = require('passport')
const controller = require('../controllers/feedback')
const router = express.Router()

router.get('/user=:user', passport.authenticate('jwt', {session: false}), controller.getAll)
router.post('/create', passport.authenticate('jwt', {session: false}), controller.create)

module.exports = router