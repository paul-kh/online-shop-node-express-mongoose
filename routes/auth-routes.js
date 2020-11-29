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

router.get("/password-reset-email", authController.getPasswordResetEmail);

router.post("/password-reset-email", authController.postPasswordResetEmail);

router.get("/password-reset/:passwordToken", authController.getPasswordReset)

router.post("/password-reset", authController.postPasswordReset);

module.exports = router;