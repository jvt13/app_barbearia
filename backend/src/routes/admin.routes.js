const express = require('express')
const { getDashboard } = require('../controllers/admin.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/dashboard', authenticate, authorize('admin', 'barber'), getDashboard)

module.exports = router
