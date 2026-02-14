const { Op } = require('sequelize')
const { Appointment, Service, User } = require('../models')

function hasTimeOverlap(startA, endA, startB, endB) {
    return startA < endB && endA > startB
}

async function listAppointments(req, res) {
    try {
        const where = req.user.role === 'client' ? { userId: req.user.id } : {}
        const appointments = await Appointment.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Service, attributes: ['id', 'name', 'price', 'duration'] }
            ]
        })
        return res.json(appointments)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list appointments', error: error.message })
    }
}

async function createAppointment(req, res) {
    try {
        const { userId, serviceId, date, status } = req.body
        const resolvedUserId = req.user.role === 'client' ? req.user.id : userId
        if (!resolvedUserId || !serviceId || !date) {
            return res.status(400).json({ message: 'userId, serviceId and date are required' })
        }

        const appointmentDate = new Date(date)
        if (Number.isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'invalid date' })
        }

        const selectedService = await Service.findByPk(serviceId)
        if (!selectedService) {
            return res.status(404).json({ message: 'service not found' })
        }

        const selectedDuration = Number(selectedService.duration || 0)
        if (!selectedDuration || selectedDuration <= 0) {
            return res.status(400).json({ message: 'service duration must be greater than zero' })
        }

        const resolvedStatus = req.user.role === 'client' ? 'pending' : (status || 'pending')
        if (['pending', 'confirmed'].includes(resolvedStatus)) {
            const activeAppointments = await Appointment.findAll({
                where: {
                    status: { [Op.in]: ['pending', 'confirmed'] }
                },
                include: [{ model: Service, attributes: ['id', 'duration'] }]
            })

            const newStart = appointmentDate.getTime()
            const newEnd = newStart + (selectedDuration * 60 * 1000)

            const hasConflict = activeAppointments.some((item) => {
                const existingDuration = Number(item.Service?.duration || 0)
                if (!existingDuration || !item.date) return false

                const existingStart = new Date(item.date).getTime()
                const existingEnd = existingStart + (existingDuration * 60 * 1000)

                return hasTimeOverlap(newStart, newEnd, existingStart, existingEnd)
            })

            if (hasConflict) {
                return res.status(409).json({ message: 'selected time is not available' })
            }
        }

        const appointment = await Appointment.create({
            userId: resolvedUserId,
            serviceId,
            date: appointmentDate,
            status: resolvedStatus
        })
        return res.status(201).json(appointment)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create appointment', error: error.message })
    }
}

async function updateAppointmentStatus(req, res) {
    try {
        const { id } = req.params
        const { status } = req.body
        const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed']

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'invalid status' })
        }

        const appointment = await Appointment.findByPk(id)
        if (!appointment) {
            return res.status(404).json({ message: 'appointment not found' })
        }

        appointment.status = status
        await appointment.save()
        return res.json(appointment)
    } catch (error) {
        return res.status(500).json({ message: 'failed to update appointment status', error: error.message })
    }
}

module.exports = {
    listAppointments,
    createAppointment,
    updateAppointmentStatus
}
