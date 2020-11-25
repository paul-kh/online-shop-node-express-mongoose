const Express = require("express");
const router = Express.Router();
const shopController = require("../controllers/shop-controller");

router.get('/', shopController.getHomepage);
router.get('/products', shopController.getProducts);
router.get('/cart', shopController.getCart);
router.get('/orders', shopController.getOrders);

router.post('/cart', shopController.postCart);


module.exports = router;