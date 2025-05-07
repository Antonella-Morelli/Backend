const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const authorModel = require('./schemaAuthor')

const jwtSecretKey = process.env.JWT_SECRET_KEY

const authMiddleware = async (req, res, next) => {
    try {
        const tokenBearer = req.headers.authorization

        if (tokenBearer !== undefined) {
            const token = tokenBearer.replace('Bearer ', '')
            const data = await verifyJWT(token)

            if (!mongoose.isValidObjectId(data.authorId)) {
                return res.status(400).json({ message: 'Invalid author ID' })
            }

            const userFound = await authorModel.findById(data.authorId)
            if (userFound) {
                req.author = userFound
                return next()
            } else {
                return res.status(401).send('User not found')
            }

        } else {
            return res.status(403).send('Token required')
        }

    } catch (err) {
        console.error(err)
        next('Token error: ' + err)
    }
}

const verifyJWT = (token) => {
    return new Promise((res, rej) => {
        jwt.verify(token, jwtSecretKey, (err, data) => {
            if (err) rej(err)
            else res(data)
        })
    })
}

module.exports = authMiddleware

