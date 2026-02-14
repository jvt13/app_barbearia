const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || ''
    const [, token] = authHeader.split(' ')

    if (!token) {
        return res.status(401).json({ message: 'missing token' })
    }

    try {
        const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
        const payload = jwt.verify(token, secret)
        req.user = payload
        return next()
    } catch (_error) {
        return res.status(401).json({ message: 'invalid token' })
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'forbidden' })
        }
        return next()
    }
}

module.exports = {
    authenticate,
    authorize
}
