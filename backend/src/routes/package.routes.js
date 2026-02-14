const express = require('express')
const { createPackage, listPackages } = require('../controllers/package.controller')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/', listPackages)
router.post('/', authenticate, authorize('admin', 'barber'), createPackage)

module.exports = router
