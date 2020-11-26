const Express = require("express");

const router = Express.Router();

const authController = require("../controllers/auth-controller");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

module.exports = router;