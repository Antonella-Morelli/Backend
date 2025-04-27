require('dotenv').config({ path: '../.env' })

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')



// SCHEMA POST
const postsModel = require('./schemaPost')

const app = express()
const port = 3002
const mongoUri = process.env.MONGO_URI

app.use(cors())
app.use(express.json())

//MULTER & CLOUDINARY
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'post_covers',
        resource_type: 'auto',
    },
})

// CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: storage })

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


// GET /authors/:id/posts - Post di uno specifico autore
app.get('/authors/:id/posts', async (req, res) => {
    try {
        const authorId = req.params.id
        const posts = await postsModel.find({ author: authorId }).populate('author')

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

// PATCH - Caricare la cover del post
app.patch('/posts/:postId/cover', upload.single('cover'), async (req, res) => {
    const { postId } = req.params

    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato' })
    }

    try {
        const coverUrl = req.file.path

        const updatedPost = await postsModel.findByIdAndUpdate(
            postId,
            { cover: coverUrl },
            { new: true }
        )

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post non trovato' })
        }

        res.status(200).json({
            message: 'Copertura caricata con successo',
            coverUrl: coverUrl,
            post: updatedPost,
        })
    } catch (err) {
        res.status(500).json({ error: 'Errore nel caricamento dell\'immagine' })
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