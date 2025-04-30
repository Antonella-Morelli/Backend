const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Author',
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
        },
    },
)

module.exports = mongoose.model('Comment', commentSchema)
