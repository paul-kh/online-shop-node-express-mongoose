const Express = require('express');

const router = Express.Router();

// Import controller module
const adminController = require("../controllers/admin-controller");

router.post("/add-product", adminController.postAddProduct);
router.get("/add-product", adminController.getAddProduct);
router.get("/products", adminController.getProducts);


module.exports = router;