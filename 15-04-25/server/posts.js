const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// SCHEMA POST
const postsModel = require('./schemaPost')

const app = express()
const port = 3002
const dbName = 'StriveBlog'

app.use(cors())
app.use(express.json())


// BASE
app.get('/', (req, res) => {
    res.json({ message: 'post service attivo' })
})

// GET /posts - Lista post
app.get('/posts', async (req, res) => {

    const page = Number(req.query.page)
    const limit = Number(req.query.limit)

    try {
        const skip = (page - 1) * limit
        const posts = await postsModel.find().populate('author').skip(skip).limit(limit)

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            cover: post.cover,
            author: {
                name: `${post.author.nome} ${post.author.cognome}`,
                avatar: post.author.avatar
            }
        }))

        res.status(200).json(formattedPosts)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /posts/:_id - Singolo post
app.get('/posts/:_id', async (req, res) => {
    try {
        const post = await postsModel.findById(req.params._id).populate('author')

        const formattedPost = {
            _id: post._id,
            title: post.title,
            cover: post.cover,
            content: post.content,
            author: {
                name: `${post.author.nome} ${post.author.cognome}`,
                avatar: post.author.avatar
            }
        }

        res.status(200).json(formattedPost)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST /posts - Crea nuovo post
app.post('/posts', async (req, res) => {
    try {
        const newPost = new postsModel(req.body)
        const savedPost = await newPost.save()
        res.status(201).json(savedPost)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PUT /posts/:_id - Modifica post
app.put('/posts/:_id', async (req, res) => {
    try {
        const updatedPost = await postsModel.findByIdAndUpdate(req.params._id, req.body, { new: true })
        res.status(200).json(updatedPost)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /posts/:_id - Elimina post
app.delete('/posts/:_id', async (req, res) => {
    try {
        await postsModel.findByIdAndDelete(req.params._id)
        res.status(200).json({ message: 'Post eliminato' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Connessione al DB 
async function start() {
    try {
        await mongoose.connect('mongodb+srv://antonellamorelli1998:Antonella.98@clusterantonella.fijtagm.mongodb.net/' + dbName)
        app.listen(port, () => {
            console.log(`Attivo su port ${port}`)
        })
    } catch (err) {
        console.error('Errore nella connessione al DB:', err)
    }
}

start()