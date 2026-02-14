const express = require('express')
const { createProduct, listProducts } = require('../controllers/product.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', listProducts)
router.post('/', authenticate, authorize('admin', 'barber'), createProduct)

module.exports = router
