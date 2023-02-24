const express = require('express')
const passport = require('passport')
const controller = require('../controllers/chatTemplate')
const router = express.Router()
// 

router.get('/my', passport.authenticate('jwt', {session: false}), controller.getMyChatTemplates) // Получить все свои шаблоны чата
router.post('/create', passport.authenticate('jwt', {session: false}), controller.create) // Создать шаблон чата
router.post('/delete', passport.authenticate('jwt', {session: false}), controller.delete) // Удалить шаблон чата
router.post('/update', passport.authenticate('jwt', {session: false}), controller.update) // Изменение данных шаблона чата

module.exports = router