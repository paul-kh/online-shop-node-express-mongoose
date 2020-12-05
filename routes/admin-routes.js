const Express = require("express");
const router = Express.Router();
const { body } = require("express-validator");

// Import controller module
const adminController = require("../controllers/admin-controller");
// Import middleware for checking authentication
const checkAuth = require("../middleware/check-auth");

// Send form for adding new product for GET '/admin/add-product'
router.get("/add-product", checkAuth, adminController.getAddProduct);

// Receive POST req for adding new product, and save the new product to DB - POST '/admin/add-product'
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  checkAuth,
  adminController.postAddProduct
);

// // Send all products as product list for GET '/admin/products'
router.get("/products", checkAuth, adminController.getProducts);

// // Send form for editing a product - GET '/admin/edit-product'
router.get(
  "/edit-product/:productId",
  checkAuth,
  adminController.getEditProduct
);

// // Receive POST req for editing a product, and update the product in DB - POST '/admin/edit-product
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  checkAuth,
  adminController.postEditProduct
);

// // Delete a product - POST '/admin/delete-product/'
router.post("/delete-product/", checkAuth, adminController.postDeleteProduct);

module.exports = router;
