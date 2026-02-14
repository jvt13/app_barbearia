const { Payment, User } = require('../models')

async function listPayments(req, res) {
    try {
        const where = req.user.role === 'client' ? { userId: req.user.id } : {}
        const payments = await Payment.findAll({
            where,
            include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        })
        return res.json(payments)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list payments', error: error.message })
    }
}

async function createPayment(req, res) {
    try {
        const { userId, amount, method, status = 'pending' } = req.body
        const resolvedUserId = req.user.role === 'client' ? req.user.id : userId
        if (!resolvedUserId || amount == null || !method) {
            return res.status(400).json({ message: 'userId, amount and method are required' })
        }

        const payment = await Payment.create({
            userId: resolvedUserId,
            amount,
            method,
            status
        })
        return res.status(201).json(payment)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create payment', error: error.message })
    }
}

module.exports = {
    listPayments,
    createPayment
}
