const Express = require("express");
const router = Express.Router();
const shopController = require("../controllers/shop-controller");
const checkAuth = require("../middleware/check-auth");

router.get("/", shopController.getHomepage);

router.get("/products/:productId", shopController.getProduct);

router.get("/products", shopController.getProducts);

router.get("/cart", checkAuth, shopController.getCart);

router.post("/cart", checkAuth, shopController.postCart);

router.post(
  "/cart-delete-item",
  checkAuth,
  shopController.postCartDeleteProduct
);

router.get("/checkout", shopController.getCheckout);

router.get("/checkout/cancel", shopController.getCheckout);

router.get("/checkout/success", shopController.getCheckoutSuccess);

// router.post("/create-order", checkAuth, shopController.postOrder); // replaced by GET "/checkout/success"

router.get("/orders", checkAuth, shopController.getOrders);

router.get("/orders/:orderId", checkAuth, shopController.getInvoice);

module.exports = router;
