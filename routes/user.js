const express = require('express')
const passport = require('passport')
const controller = require('../controllers/user')
const router = express.Router()

// router.post('/register', passport.authenticate('jwt', {session: false}), controller.register)
router.post('/register', controller.register)
router.post('/activate', controller.activate)
router.post('/deactivate', controller.deactivate)
router.post('/delete', controller.delete)
router.post('/addAdmin', controller.addAdmin)
router.post('/addModerator', controller.addModerator)
router.post('/deleteAdmin', controller.deleteAdmin)
router.post('/deleteModerator', controller.deleteModerator)
router.get('/getAll', controller.getAllUsers)
router.get('/id:=id', controller.getUserById)

module.exports = router