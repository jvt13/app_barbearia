const express = require('express')
const { createAppointment, listAppointments, updateAppointmentStatus } = require('../controllers/appointment.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', authenticate, listAppointments)
router.post('/', authenticate, authorize('admin', 'barber', 'client'), createAppointment)
router.patch('/:id/status', authenticate, authorize('admin', 'barber'), updateAppointmentStatus)

module.exports = router
