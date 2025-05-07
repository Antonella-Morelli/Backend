const express = require('express')

// SCHEMA
const commentsModel = require('./schemaComment')
const postsModel = require('./schemaPost')

const authMiddleware = require('./authMiddleware')

const router = express.Router()

router.use(authMiddleware)

//GET /POSTS/:ID/COMMENTS - LISTA COMMENTI DI UN POST SPECIFICO
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params
        const comments = await commentsModel.find({ post: postId })
        res.status(200).json(comments)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

//GET /POSTS/:ID/COMMENTS/:COMMENTID - COMMENTO SPECIFICO DI UN POST SPECIFICO
router.get('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params
        const comment = await commentsModel.findOne({ _id: commentId, post: postId })
        res.status(200).json(comment)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
//POST /POSTS/:ID - AGGIUNGE COMMENTO AD UN POST SPECIFICO
router.post('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params
        const newComment = new commentsModel({
            text: req.body.text,
            post: postId,
            author: req.author._id
        })
        const savedComment = await newComment.save()
        res.status(201).json(savedComment)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})
//PUT /POSTS/:ID/COMMENT/:COMMENTID - CAMBIA UN COMMENTO DI UN POST SPECIFICO
router.put('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params
        const comment = await commentsModel.findOne({ _id: commentId, post: postId })

        if (!comment) return res.status(404).json({ error: 'Commento non trovato' })

        if (comment.author.toString() !== req.author._id.toString()) {
            return res.status(403).json({ error: 'Non sei autorizzato a modificare questo commento' })
        }

        comment.text = req.body.text || comment.text
        const updated = await comment.save()

        res.status(200).json(updated)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
//DELETE /POSTS/:ID/COMMENT/:COMMENTID - ELIMINA UN COMMENTO SPECIFICO DA UN POST SPECIFICO
router.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params
        const comment = await commentsModel.findOne({ _id: commentId, post: postId })

        if (!comment) return res.status(404).json({ error: 'Commento non trovato' })

        if (comment.author.toString() !== req.author._id.toString()) {
            return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo commento' })
        }

        await commentsModel.findByIdAndDelete(commentId)
        res.status(200).json({ message: 'Commento eliminato con successo' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


module.exports = router