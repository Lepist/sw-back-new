const express = require('express')
const passport = require('passport')
const controller = require('../controllers/account')
const router = express.Router()

router.get('/user=:user', passport.authenticate('jwt', {session: false}), controller.getAll)
router.post('/create', passport.authenticate('jwt', {session: false}), controller.create)
router.post('/delete', passport.authenticate('jwt', {session: false}), controller.delete)

module.exports = router