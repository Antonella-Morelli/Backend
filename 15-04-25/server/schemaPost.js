const mongoose = require('mongoose')
const Author = require('./schemaAuthor')

const postSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  cover: { type: String, required: true },
  readTime: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }, 
  content: { type: String, required: true }
})

const Post = mongoose.model('Post', postSchema)  

module.exports = Post

