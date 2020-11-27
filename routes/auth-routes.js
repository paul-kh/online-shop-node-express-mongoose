const Express = require("express");

const router = Express.Router();

const authController = require("../controllers/auth-controller");
const { route } = require("./admin-routes");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

module.exports = router;