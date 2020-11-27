const Express = require("express");
const router = Express.Router();
const shopController = require("../controllers/shop-controller");
const checkAuth = require("../middleware/check-auth");

// Render home page => GET '/'
router.get('/', shopController.getHomepage);

// // Render product details => GET '/product/:productId'
router.get('/products/:productId', shopController.getProduct);

// // Render product list => GET '/products'
router.get('/products', shopController.getProducts);

// // Render cart => GET '/cart'
router.get('/cart', checkAuth, shopController.getCart);

// // Add product to cart
router.post('/cart', checkAuth, shopController.postCart);

// // Remove product from cart
router.post('/cart-delete-item', checkAuth, shopController.postCartDeleteProduct);

// // Add order => POST '/create-order
router.post('/create-order', checkAuth, shopController.postOrder);

// // Render orders => GET '/orders'
router.get('/orders', checkAuth, shopController.getOrders);


module.exports = router;