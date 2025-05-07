const express = require('express')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateTokenJWT = require('./token')
const authMiddleware = require('./authMiddleware')


//SCHEMA
const authorsModel = require('./schemaAuthor')
const postsModel = require('./schemaPost')

const router = express.Router()

//MULTER & CLOUDINARY
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
})

const upload = multer({ storage: storage })

//CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


// GET /authors/me – Dati dell’utente autenticato
router.get('/me', authMiddleware, async (req, res) => {
    const { password, ...user } = req.author.toObject()        // MODIFICA: req.author settato dal middleware
    res.status(200).json(user)
})


// POST /authors/login – autenticazione e rilascio token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await authorsModel.findOne({ email })
        if (!user) return res.status(401).json({ error: 'Credenziali non valide' })

        const match = await bcrypt.compare(password, user.password)  // MODIFICA: confronto con hash
        if (!match) return res.status(401).json({ error: 'Credenziali non valide' })

        const token = await generateTokenJWT({ authorId: user._id }) // MODIFICA: generazione JWT
        res.status(200).json({ token })
    } catch (err) {
        console.error('Errore login:', err)
        res.status(500).json({ error: 'Impossibile effettuare il login' })
    }
})

// -------- ENDPOINT PUBBLICI ---------

//GET /authors - Lista autori
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    try {
        const authors = await authorsModel.find()
            .skip(skip)
            .limit(limit)
            .select('-password')                                   // MODIFICA: escludo password
        res.status(200).json(authors)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//POST /authors - Crea nuovo autore
router.post('/', async (req, res) => {
    try {
        const { nome, cognome, email, dataDiNascita, avatar, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10) 
        const newAuthor = new authorsModel({ nome, cognome, email, dataDiNascita, avatar, password: hashedPassword })
        const dbAuthor = await newAuthor.save()
        const { password: _, ...authorWithoutPass } = dbAuthor.toObject()
        res.status(200).json(authorWithoutPass)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

//GET /authors/:id/posts
router.get('/:id/posts', async (req, res) => {
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


//-------ENDPOINT PROTETTI------
router.use(authMiddleware)

//GET /authors/:_id - Singolo autore
router.get('/:_id', async (req, res) => {
    try {
        const author = await authorsModel.findById(req.params._id).select('-password')
        res.status(200).json(author)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


//PUT /authors/:_id - Modifica autore
router.put('/:_id', async (req, res) => {
    try {
        const updatedAuthor = await authorsModel.findByIdAndUpdate(req.params._id, req.body, { new: true }).select('-password')
        res.status(200).json(updatedAuthor)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//DELETE /authors/:_id - Elimina autore
router.delete('/:_id', async (req, res) => {
    try {
        await authorsModel.findByIdAndDelete(req.params._id)
        res.status(200).json({ message: 'Autore eliminato con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


//PATCH -  Caricare l'avatar di un autore specifico
router.patch('/:authorId/avatar', upload.single('avatar'), async (req, res) => {
    const { authorId } = req.params

    if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'Nessun file caricato' })
    }

    try {
        const updatedAuthor = await authorsModel.findByIdAndUpdate(
            authorId,
            { avatar: req.file.path },
            { new: true }
        ).select('-password')

        if (!updatedAuthor) {
            return res.status(404).json({ error: 'Autore non trovato' })
        }

        res.status(200).json({
            message: 'Avatar caricato con successo',
            avatarUrl: req.file.path,
            author: updatedAuthor,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Errore nel caricamento dell\'immagine' })
    }
})



module.exports = router