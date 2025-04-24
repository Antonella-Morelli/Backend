const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true },
    dataDiNascita: { type: String, required: true },
    avatar: { type: String, required: true }
})

const authorsModel = mongoose.model('Author', authorSchema)

module.exports = authorsModel
