const Express = require("express");
const router = Express.Router();
const { check, body } = require("express-validator/check");
const User = require("../models/user");

const authController = require("../controllers/auth-controller");
const { route } = require("./admin-routes");
const isLoginAgain = require("../middleware/is-login-again");

router.get("/login", isLoginAgain, authController.getLogin);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    check("password", "Please enter a valid password.")
      .isLength({ min: 5 })
      .trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  // We can wrap all the validator functions in an array to group all
  // validating middlewares. However, this is optional.
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail() // Lowercasing and trim (remove white space) the input email
      .custom((emailValue, { req }) => {
        // if (emailValue === 'test@test.com') {
        //   throw new Error('This email address is forbidden.');
        // }
        // return true;

        // Check for email existence
        return User.findOne({ email: emailValue }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "The email was already taken by someone else. Please pick a new one."
            );
          }
        });
      }),
    // 'body' is an alternative for 'check'
    body("password", "Invalid password")
      .isLength({ min: 5 })
      .trim()
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      // Check for equality betwen 'confirm pasword' and 'password'
      .custom((confirmPwdValue, { req }) => {
        if (confirmPwdValue !== req.body.password) {
          throw new Error("The confirm password has to match the password."); // 'throw' implicit the 'return' keyword
        }
        // if confirmPassword === password
        return true;
      }),
  ],
  authController.postSignup
);

router.get("/password-reset-email", authController.getPasswordResetEmail);

router.post(
  "/password-reset-email",
  check("email", "Please enter a valid email.")
    .isEmail()
    .trim()
    .normalizeEmail(),
  authController.postPasswordResetEmail
);

router.get("/password-reset/:passwordToken", authController.getPasswordReset);

router.post("/password-reset", authController.postPasswordReset);

module.exports = router;
