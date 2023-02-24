const express = require('express')
const passport = require('passport')
const controller = require('../controllers/sushiwokClient')
const router = express.Router()
// 

router.get('/', passport.authenticate('jwt', {session: false}), controller.getClients) // Получить список клиентов
router.post('/delete', passport.authenticate('jwt', {session: false}), controller.delete) // Удалить клиента
router.post('/update', passport.authenticate('jwt', {session: false}), controller.update) // Изменение данных клиента

module.exports = router