const express = require('express')
const passport = require('passport')
const controller = require('../controllers/botTemplate')
const router = express.Router()

router.get('/my', passport.authenticate('jwt', {session: false}), controller.getMyBotTemplates)
router.post('/create', passport.authenticate('jwt', {session: false}), controller.create)
router.post('/delete', passport.authenticate('jwt', {session: false}), controller.delete)
router.post('/update', passport.authenticate('jwt', {session: false}), controller.update) // Изменение данных шаблона
router.get('/allFormatted', passport.authenticate('jwt', {session: false}), controller.getAllFormattedBotTemplates) // Данные о шаблонах бота для селекта

module.exports = router