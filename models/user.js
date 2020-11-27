const mongoose = require("mongoose");
const Product = require("./product");

// Instantiate a mongoose schema 'userSchema' by calling
// the constructor of the class 'Schema' of mongoose module.
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
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

// CREATE A METHOD THAT ALLOWS USER TO ADD A PRODUCT TO THE CART //
//==================================================================
// Mongoose 's 'methods' object allow us to create our own function/method to work 
// with the schema
userSchema.methods.addToCart = function (product) {
    // Try to find if product was previousely added in the cart.
    // If it's the case, increase the quantity.
    // * Find the index in the array this.cart.items that might store the 

    //   product that is about to be added to the cart.
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });

    // Initialize quantity with 1, and it will be incremented 
    // by 1 if product has been existing in the cart.
    let newQuantity = 1;

    // Intialize an array to temporarily store all current cart items
    // that the user might have added to the cart before.
    const tempCartItems = [...this.cart.items];

    // Case: Product was previousely added to the cart
    if (cartProductIndex >= 0) {
        // Increment quantity
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        // Updated the array of cart items with the newly incremented quantity
        tempCartItems[cartProductIndex].quantity = newQuantity;
    }
    // Case: Product has never been previousely added to cart ==> findIndex() return -1
    else {
        // Add new product(id & quantity) to the array of cart items
        tempCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    // Assign cart items to the 'cart' property of the model
    this.cart = { items: tempCartItems };
    return this.save();
};

// CREATE A METHOD THAT ALLOWS USER TO DELETE A PRODUCT IN THE CART //
// ===================================================================
userSchema.methods.deleteCartItem = function (productId) {
    this.cart.items = this.cart.items.filter(p => {
        return p.productId != productId;
    });
    return this.save();
}

// CREATE A METHOD TO CLEAR CART AFTER ORDER IS PLACED
userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
