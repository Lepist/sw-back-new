const express = require('express')
const controller = require('../controllers/depotType')
const router = express.Router()
// 

router.get('/', controller.getAllTypes) // Получаем типы ТТ (Магазин/Производство)

module.exports = router