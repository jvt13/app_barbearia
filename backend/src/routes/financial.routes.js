const express = require('express')
const { createPayment, listPayments } = require('../controllers/financial.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/payments', authenticate, listPayments)
router.post('/payments', authenticate, authorize('admin', 'barber'), createPayment)

module.exports = router
