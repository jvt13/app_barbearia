const { Appointment, Payment, Service, User } = require('../models')

async function getDashboard(_req, res) {
    try {
        const [users, services, appointments, payments] = await Promise.all([
            User.count(),
            Service.count(),
            Appointment.count(),
            Payment.count()
        ])

        return res.json({
            users,
            services,
            appointments,
            payments
        })
    } catch (error) {
        return res.status(500).json({ message: 'failed to load dashboard', error: error.message })
    }
}

module.exports = {
    getDashboard
}
