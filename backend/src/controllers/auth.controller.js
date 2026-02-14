const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

function buildToken(user) {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '1d' }
    )
}

async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' })
        }

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(409).json({ message: 'email already in use' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'client'
        })

        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        })
    } catch (error) {
        return res.status(500).json({ message: 'failed to register user', error: error.message })
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' })
        }

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({ message: 'invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'invalid credentials' })
        }

        const token = buildToken(user)
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(500).json({ message: 'failed to login', error: error.message })
    }
}

module.exports = {
    register,
    login
}
