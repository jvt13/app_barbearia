const express = require('express')
const { listClients } = require('../controllers/client.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', authenticate, authorize('admin', 'barber'), listClients)

module.exports = router
