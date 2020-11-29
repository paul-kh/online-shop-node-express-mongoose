const User = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: "fake_sendGridAPI"
    }
}));

// Show the login page => GET '/login'
exports.getLogin = (req, res, next) => {
    // Set errorMsg=null if flash() dosn't produce any message
    /* This way, we can hide html element (<div>) that will hold the errorMsg to display.
    /* flash() return empty array [] if no message */
    let msg = req.flash("errorMsg"); // access 'errorMsg' property from 'flash' object in the session db collection
    msg.length > 0 ? msg = msg[0] : msg = null;

    res.render("auth-views/login", {
        path: "/login",
        pageTitle: "Login",
        errorMsg: msg
    });
};

// Authenticate the user's login request => POST '/login'
exports.postLogin = (req, res, next) => {
    // Create session variables and set their values
    // The variables and values will be stored in mongdb ('sessions' collection)
    // This is because we use 'connect-mongdb-session' to tell 'express-session' where to store the sessions
    // The setup was done in 'app.js'
    // Examples: 
    //   req.session.isLoggedIn = true;
    //   req.session.clientCookie = req.headers.cookie;
    //   ... more session variables...
    // ===================================================

    const email = req.body.email;
    const password = req.body.password;
    // * Find user by email
    // * If not found => redirect to '/login'
    // * If found:
    // * Decrypt the password & compare password
    // * - If match, create sessions for the user & redirect to '/'
    // * - If not match, redirect to '/login' or flash message
    User.findOne({ email: email })
        .then(foundUser => {
            if (!foundUser) {
                req.flash("errorMsg", "Invalid email or password.");
                return res.redirect("/login");
            }
            bcrypt.compare(password, foundUser.password)
                .then(compareResult => {
                    if (compareResult) {
                        // Create property 'isLoggedIn' of the session object and set value to 'true'
                        // The value of this property will be used to set value for variable of 'res.locals.isAuthenticated' 
                        // by app.js to pass to all render views "res.render()"
                        req.session.isLoggedIn = true;
                        // Create property session.user and will be used to set value for 'res.locals.user' in 'app.js'
                        // to pass data as "logged-in user" object for the entire time the user stays logged in.  
                        req.session.user = foundUser;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect("/");
                        });
                    }
                    req.flash("errorMsg", "Invalid email or password.");
                    res.redirect("/login");
                })
                .catch(bcryptCompareErr => { console.log(bcryptCompareErr) });
        })
        .catch(err => console.log(err));
};

// Log the currently logged-in user out => POST '/loggout'
exports.postLogout = (req, res, next) => {
    // Remove session in the DB for the current request
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/login");
    });
};

// Show Signup page/form => GET '/signup'
exports.getSignup = (req, res, next) => {
    let msg = req.flash("errorMsg"); // access 'errorMsg' property from 'flash' object in the session db collection
    msg.length > 0 ? msg = msg[0] : msg = null;
    res.render("auth-views/signup", {
        pageTitle: "Signup Page",
        path: "/signup",
        errorMsg: msg
    });
};

// Process a user's signup request => POST '/signup'
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Check if email already exists
    User.findOne({ email: email })
        .then(foundUser => {
            if (foundUser) {
                req.flash("errorMsg", "The email was already used before.");
                return res.redirect("/signup");
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect("/login");
                    return transporter.sendMail({
                        to: email,
                        from: 'fakemail@fake-domain.com',
                        subject: "Signup succeeded",
                        html: "<h1> You have successfully signed up!</h1>"
                    })
                        .catch(error => {
                            if (error) {
                                return console.log("Error: The email will be sent once sender identity is verified.\nThe server is still running...");
                            }
                        });
                })
                .catch(err => console.log(err));
        })
        .catch(err => { console.log(err) });
}

// Render password request form => GET '/password-reset-email'
exports.getPasswordResetEmail = (req, res, next) => {
    let msg = req.flash("errorMsg"); // access 'errorMsg' property from 'flash' object in the session db collection
    msg.length > 0 ? msg = msg[0] : msg = null;
    res.render("auth-views/password-reset-email", {
        pageTitle: "Reset Password",
        path: "/reset-password-method",
        errorMsg: msg
    });
}

// Receive & Process password request form => POST '/password-reset-method'
exports.postPasswordResetEmail = (req, res, next) => {
    // Create a token to be included in a password-reset link of email that is sent to the user
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log("Crypto Error:", err);
            return res.redirect("/reset-password-email");
        }
        const token = buffer.toString("hex"); // convert buffer's code (randomized and hashed code) to hexa string

        // Find user by the given email
        User.findOne({ email: req.body.email })
            .then(user => {
                // If the given email doesn't match any user
                if (!user) {
                    req.flash("errorMsg", "The email doesn't match any account.");
                    return res.redirect("/password-reset-email");
                }
                // If the given email matches a user
                // * Add token & its expiration date to user data in DB
                user.pwdResetToken = token;
                user.pwdResetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                // Send email with a link included password reset token to user's email address
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'fakemail@fake-domain.com',
                    subject: 'Password reset',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                  `
                })
                    .then(result => {
                        console.log("The email was sent out!");
                    })
                    .catch(err => {
                        if (err) return console.log("The email cannot be sent since Sendgrid needs to unlocked the sender account first.\nThe server is still running...");
                    });
            })
            .catch(err => {
                console.log(err);
            });
    });
}

// Render password reset form => GET '/password-reset/:passwordToken'
exports.getPasswordReset = (req, res, next) => {
    const passwordToken = req.params.passwordToken;

    User.findOne({ pwdResetToken: passwordToken, pwdResetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            // Prevent rendering DOM for an empty error message
            let msg = req.flash("errorMsg"); // access 'errorMsg' property from 'flash' object in the session db collection
            msg.length > 0 ? msg = msg[0] : msg = null;

            // Render password reset form by passing all necessary data
            res.render("auth-views/password-reset", {
                pageTitle: "Reset Password",
                path: "/password-reset",
                errorMsg: msg,
                passwordToken: passwordToken,
                userId: user._id.toString()
            });
        })
        .catch(err => { console.log(err) });
}

// Process password reset form => POST '/password-reset'
exports.postPasswordReset = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let userResettingPwd;

    // Protect if user manipulates form data in the client's browser
    // * Check if token & userId are matched & token expiration is not expired yet
    User.findOne({
        pwdResetToken: passwordToken,
        pwdResetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            userResettingPwd = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            userResettingPwd.password = hashedPassword;
            userResettingPwd.pwdResetToken = undefined;
            userResettingPwd.pwdResetTokenExpiration = undefined;
            return userResettingPwd.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => { console.log(err) });
}