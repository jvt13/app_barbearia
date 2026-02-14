const express = require('express')
const { createProfessional, listProfessionals } = require('../controllers/professional.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', listProfessionals)
router.post('/', authenticate, authorize('admin', 'barber'), createProfessional)

module.exports = router
