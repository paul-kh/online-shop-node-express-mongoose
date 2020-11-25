const Express = require("express");
const router = Express.Router();
const shopController = require("../controllers/shop-controller");

router.get('/', shopController.getHomepage);
router.get('/products', shopController.getProducts);
router.get('/cart', shopController.getCart);
router.get('/orders', shopController.getOrders);

// Add product to cart
router.post('/cart', shopController.postCart);

// Remove product from cart
router.post('/cart-delete-item', shopController.postCartDeleteProduct);


module.exports = router;