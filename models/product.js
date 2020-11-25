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
    }
});

// Mongoose will create a collection by lowering case and pluralizing the model name
// 'Product' in the first argument of the method mongoose.model()
module.exports = mongoose.model('Product', productSchema);