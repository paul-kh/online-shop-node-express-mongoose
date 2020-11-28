const Express = require("express");

const router = Express.Router();

const authController = require("../controllers/auth-controller");
const { route } = require("./admin-routes");
const isLoginAgain = require("../middleware/is-login-again");

router.get("/login", isLoginAgain, authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

router.get("/password-reset-method", authController.getPasswordResetMethod);

router.post("/password-reset-method", authController.postPasswordResetMethod);

router.get("/password-reset/:passwordToken", authController.getPasswordReset)

router.post("/password-reset", authController.postPasswordReset);

module.exports = router;