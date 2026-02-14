const { Professional } = require('../models')

async function listProfessionals(req, res) {
    try {
        const where = {}
        if (!req.user || req.user.role === 'client') {
            where.active = true
        }

        const professionals = await Professional.findAll({ where })
        return res.json(professionals)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list professionals', error: error.message })
    }
}

async function createProfessional(req, res) {
    try {
        const { name, specialty, bio, avatarUrl, active = true } = req.body
        if (!name || !specialty) {
            return res.status(400).json({ message: 'name and specialty are required' })
        }

        const professional = await Professional.create({
            name,
            specialty,
            bio,
            avatarUrl,
            active: active !== false
        })

        return res.status(201).json(professional)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create professional', error: error.message })
    }
}

module.exports = {
    listProfessionals,
    createProfessional
}
