const Express = require('express');

const router = Express.Router();

// Import controller module
const adminController = require("../controllers/admin-controller");

// Receive POST req for adding new product, and save the new product to DB - POST '/admin/add-product'
router.post("/add-product", adminController.postAddProduct);

// Send form for adding new product for GET '/admin/add-product'
router.get("/add-product", adminController.getAddProduct);

// Send all products as product list for GET '/admin/products'
router.get("/products", adminController.getProducts);

// Send form for editing a product - GET '/admin/edit-product'
router.get('/edit-product/:productId', adminController.getEditProduct);

// Receive POST req for editing a product, and update the product in DB - POST '/admin/edit-product
router.post('/edit-product', adminController.postEditProduct);

// Delete a product - POST '/admin/delete-product/'
router.post("/delete-product/", adminController.postDeleteProduct);

module.exports = router;