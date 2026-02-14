const { User } = require('../models')

async function listClients(_req, res) {
    try {
        const clients = await User.findAll({
            where: { role: 'client' },
            attributes: ['id', 'name', 'email', 'role']
        })
        return res.json(clients)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list clients', error: error.message })
    }
}

module.exports = {
    listClients
}
