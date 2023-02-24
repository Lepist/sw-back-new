const express = require('express')
const passport = require('passport')
const controller = require('../controllers/depot')
const router = express.Router()
// 

router.get('/my', passport.authenticate('jwt', {session: false}), controller.getMyDepots) // Получить все свои ТТ
router.post('/create', passport.authenticate('jwt', {session: false}), controller.create) // Создать ТТ
router.post('/delete', passport.authenticate('jwt', {session: false}), controller.delete) // Удалить ТТ
router.post('/update', passport.authenticate('jwt', {session: false}), controller.update) // Изменение данных ТТ
router.get('/allFormatted', passport.authenticate('jwt', {session: false}), controller.getAllFormattedDepots) // Данные о ТТ для селекта

module.exports = router