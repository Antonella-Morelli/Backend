const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const authorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dataDiNascita: { type: String, required: true },
    avatar: { type: String, required: true },
    password: { type: String, required: true },
})

//Hook per criptare password
authorSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const saltRounds = 10
        this.password = await bcrypt.hash(this.password, saltRounds)
    }
    next()
})

// Metodo per confrontare la password nel login
authorSchema.methods.isValidPassword = async function (pw) {
    return bcrypt.compare(pw, this.password)
}
const authorsModel = mongoose.model('Author', authorSchema)

module.exports = authorsModel
