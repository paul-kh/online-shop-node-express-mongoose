const Express = require("express");
const router = Express.Router();
const shopController = require("../controllers/shop-controller");

// Render home page => GET '/'
router.get('/', shopController.getHomepage);

// // Render product details => GET '/product/:productId'
// router.get('/products/:productId', shopController.getProduct);

// // Render product list => GET '/products'
router.get('/products', shopController.getProducts);

// // Render cart => GET '/cart'
router.get('/cart', shopController.getCart);

// // Add product to cart
router.post('/cart', shopController.postCart);

// // Remove product from cart
// router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// // Add order => POST '/create-order
// router.post('/create-order', shopController.postOrder);

// // Render orders => GET '/orders'
// router.get('/orders', shopController.getOrders);


module.exports = router;