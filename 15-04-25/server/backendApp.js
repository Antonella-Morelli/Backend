require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const postsRouter = require('./posts')
const authorsRouter = require('./authors')
const commentsRouter = require('./comments')

const app = express()
const port = 3001
const mongoUri = process.env.MONGO_URI

app.use(cors())
app.use(express.json())

// Monto i router
app.use('/posts', postsRouter)
app.use('/authors', authorsRouter)
app.use('/', commentsRouter)

async function start() {
    try {
        await mongoose.connect(mongoUri)
        app.listen(port, () => console.log(`Server attivo su port ${port}`))
    } catch (err) {
        console.error('Errore nella connessione al DB:', err)
    }
}

start()
