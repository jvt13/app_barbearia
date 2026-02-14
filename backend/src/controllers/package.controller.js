const { Package } = require('../models')

async function listPackages(req, res) {
    try {
        const where = {}
        if (!req.user || req.user.role === 'client') {
            where.active = true
        }

        const packages = await Package.findAll({ where })
        return res.json(packages)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list packages', error: error.message })
    }
}

async function createPackage(req, res) {
    try {
        const { name, description, price, duration, active = true } = req.body
        if (!name || price == null || duration == null) {
            return res.status(400).json({ message: 'name, price and duration are required' })
        }

        const parsedPrice = Number(price)
        const parsedDuration = Number(duration)
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: 'price must be a non-negative number' })
        }
        if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
            return res.status(400).json({ message: 'duration must be greater than zero' })
        }

        const servicePackage = await Package.create({
            name,
            description,
            price: parsedPrice,
            duration: parsedDuration,
            active: active !== false
        })

        return res.status(201).json(servicePackage)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create package', error: error.message })
    }
}

module.exports = {
    listPackages,
    createPackage
}
