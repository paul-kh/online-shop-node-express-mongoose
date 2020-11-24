const Express = require('express');

const router = Express.Router();

// Import controller module
const adminController = require("../controllers/admin-controller");


router.use("/add-product", adminController.getAddProduct);
router.use("/products", adminController.getProducts);


module.exports = router;