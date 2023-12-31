const mongoose = require('mongoose')
const Schema = mongoose.Schema

const itemSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        invoice: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true
        }
    },
    { 
        timestamps: true 
    }
)

module.exports = mongoose.model('Item', itemSchema)