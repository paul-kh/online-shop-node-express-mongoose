const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    // Add reference/relationship with the 'User' model
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // 'User' is the model name given when defining model for user
        required: true
    }
});

// Mongoose will create a collection by lowering case and pluralizing the model name
// 'Product' in the first argument of the method mongoose.model()
module.exports = mongoose.model('Product', productSchema);