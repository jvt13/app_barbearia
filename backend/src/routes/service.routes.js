const express = require('express')
const { createService, listServices } = require('../controllers/service.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', listServices)
router.post('/', authenticate, authorize('admin', 'barber'), createService)

module.exports = router
