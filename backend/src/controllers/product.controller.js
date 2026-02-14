const { Product } = require('../models')

async function listProducts(req, res) {
    try {
        const where = {}
        if (!req.user || req.user.role === 'client') {
            where.active = true
        }

        const products = await Product.findAll({ where })
        return res.json(products)
    } catch (error) {
        return res.status(500).json({ message: 'failed to list products', error: error.message })
    }
}

async function createProduct(req, res) {
    try {
        const { name, description, price, stock = 0, imageUrl, active = true } = req.body
        if (!name || price == null) {
            return res.status(400).json({ message: 'name and price are required' })
        }

        const parsedPrice = Number(price)
        const parsedStock = Number(stock)
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: 'price must be a non-negative number' })
        }
        if (Number.isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ message: 'stock must be a non-negative number' })
        }

        const product = await Product.create({
            name,
            description,
            price: parsedPrice,
            stock: parsedStock,
            imageUrl,
            active: active !== false
        })

        return res.status(201).json(product)
    } catch (error) {
        return res.status(500).json({ message: 'failed to create product', error: error.message })
    }
}

module.exports = {
    listProducts,
    createProduct
}
