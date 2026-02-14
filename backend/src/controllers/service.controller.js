const { Service } = require('../models')

async function listServices(_req, res) {
    try {
        const services = await Service.findAll()
        return res.json(services)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list services', error: error.message })
    }
}

async function createService(req, res) {
    try {
        const { name, description, price, duration } = req.body
        if (!name || price == null || duration == null) {
            return res.status(400).json({ message: 'name, price and duration are required' })
        }

        const service = await Service.create({ name, description, price, duration })
        return res.status(201).json(service)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create service', error: error.message })
    }
}

module.exports = {
    listServices,
    createService
}
