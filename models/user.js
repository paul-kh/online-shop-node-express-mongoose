const mongoose = require("mongoose");

// Instantiate a mongoose schema 'userSchema' by calling
// the constructor of the class 'Schema' of mongoose module.
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        // Defined embeded document for cart items which should be an array
        // holding all items that user added to the cart.
        items: [
            {
                // The type of prouctId must be the type of Mongoose's ObjectId.
                // Add reference/relationship with the 'Product' model
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }]
    }
});

module.exports = mongoose.model("User", userSchema);