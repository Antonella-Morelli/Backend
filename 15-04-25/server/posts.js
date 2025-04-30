const express = require('express')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// SCHEMA POST
const postsModel = require('./schemaPost')

const router = express.Router()

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

// GET /posts - Lista post
router.get('/', async (req, res) => {

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
router.get('/:_id', async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        const newPost = new postsModel(req.body)
        const savedPost = await newPost.save()
        res.status(201).json(savedPost)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// PUT /posts/:_id - Modifica post
router.put('/:_id', async (req, res) => {
    try {
        const updatedPost = await postsModel.findByIdAndUpdate(req.params._id, req.body, { new: true })
        res.status(200).json(updatedPost)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /posts/:_id - Elimina post
router.delete('/:_id', async (req, res) => {
    try {
        await postsModel.findByIdAndDelete(req.params._id)
        res.status(200).json({ message: 'Post eliminato' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PATCH - Caricare la cover del post
router.patch('/:postId/cover', upload.single('cover'), async (req, res) => {
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

module.exports = router