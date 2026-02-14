const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../../frontend')))

// Importar rotas
const authRoutes = require('./routes/auth.routes')
const clientRoutes = require('./routes/client.routes')
const serviceRoutes = require('./routes/service.routes')
const appointmentRoutes = require('./routes/appointment.routes')
const adminRoutes = require('./routes/admin.routes')
const financialRoutes = require('./routes/financial.routes')
const professionalRoutes = require('./routes/professional.routes')
const productRoutes = require('./routes/product.routes')
const packageRoutes = require('./routes/package.routes')

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/clients', clientRoutes)
app.use('/services', serviceRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/admin', adminRoutes)
app.use('/financial', financialRoutes)
app.use('/professionals', professionalRoutes)
app.use('/products', productRoutes)
app.use('/packages', packageRoutes)

app.use((err, _req, res, _next) => {
    res.status(500).json({
        message: 'unexpected error',
        error: err.message
    })
})

module.exports = app
