require('dotenv').config({ path: '../.env' })

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')



// SCHEMA AUTORE
const authorsModel = require('./schemaAuthor')

const app = express()
const port = 3001
const dbName = 'StriveBlog'
const mongoUri = process.env.MONGO_URI

app.use(cors())
app.use(express.json())


// BASE
app.get('/', (req, res) => {
    res.json({ message: 'App connect' })
})

// GET /authors - Lista autori
app.get('/authors', async (req, res) => {

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    try {

        const skip = (page - 1) * limit
        const authors = await authorsModel.find().skip(skip).limit(limit)

        res.status(200).json(authors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /authors/:_id - Singolo autore
app.get('/authors/:_id', async (req, res) => {
    try {
        const author = await authorsModel.findById(req.params._id)
        res.status(200).json(author)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST /authors - Crea nuovo autore
app.post('/authors', async (req, res) => {
    try {
        const obj = req.body
        const newAuthor = new authorsModel(obj)
        const dbAuthor = await newAuthor.save()
        res.status(200).json(dbAuthor)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PUT /authors/:_id - Modifica autore
app.put('/authors/:_id', async (req, res) => {
    try {
        const updatedAuthor = await authorsModel.findByIdAndUpdate(req.params._id, req.body, { new: true })
        res.status(200).json(updatedAuthor)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /authors/:_id - Elimina autore
app.delete('/authors/:_id', async (req, res) => {
    try {
        await authorsModel.findByIdAndDelete(req.params._id)
        res.status(200).json({ message: 'Autore eliminato con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Connessione al DB 
async function start() {
    try {
        await mongoose.connect(mongoUri)
        app.listen(port, () => {
            console.log(`Attivo su port ${port}`)
        })
    } catch (err) {
        console.error('Errore nella connessione al DB:', err)
    }
}

start()