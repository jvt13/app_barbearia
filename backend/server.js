require('dotenv').config({ path: `${__dirname}/.env` })
const app = require('./src/app')
const { sequelize } = require('./src/models')

const PORT = process.env.PORT || 3000

async function start() {
    try {
        const strictStartup = process.env.DB_STRICT_STARTUP === 'true'
        const autoSync = process.env.DB_AUTO_SYNC !== 'false'
        let dbConnected = false

        try {
            await sequelize.authenticate()
            dbConnected = true
            console.log('Database connection established')
        } catch (error) {
            if (strictStartup) {
                throw error
            }
            console.warn(`Database unavailable, starting in degraded mode: ${error.message}`)
        }

        if (dbConnected && autoSync) {
            await sequelize.sync({ alter: false })
            console.log('Database synchronized (missing tables created if needed)')
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    }
}

start()
