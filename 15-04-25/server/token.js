require('dotenv').config()
const jwt = require('jsonwebtoken')

const jwtSecretKey = process.env.JWT_SECRET_KEY
const jwtExpiresIn = process.env.JWT_EXPIRES_IN

const generateTokenJWT = (payload) => {
    return new Promise((res, rej) => {
        jwt.sign(
            payload,
            jwtSecretKey,
            { expiresIn: jwtExpiresIn },
            (err, token) => {
                if (err) rej(err)
                else res(token)
            }
        )
    })
}

module.exports = generateTokenJWT

