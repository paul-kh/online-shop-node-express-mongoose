const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: "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"
    }
}));

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

exports.postLogin = (req, res, next) => {
    // Create session variables and set their values
    // The variables and values will be stored in mongdb ('sessions' collection)
    // This is because we use 'connect-mongdb-session' to tell 'express-session' where to store the sessions
    // The setup was done in 'app.js'
    // req.session.isLoggedIn = true;
    // req.session.clientCookie = req.headers.cookie;
    // ... more session variables...

    // Store session variables in DB by associating the logged user
    // * Get email & password from the user's input
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
                        req.session.isLoggedIn = true;
                        req.session.user = foundUser;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect("/");
                        });
                    }
                    res.redirect("/login");
                })
                .catch(bcryptCompareErr => { console.log(bcryptCompareErr) });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    // Remove session in the DB for the current request
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/login");
    });
};

exports.getSignup = (req, res, next) => {
    let msg = req.flash("errorMsg"); // access 'errorMsg' property from 'flash' object in the session db collection
    msg.length > 0 ? msg = msg[0] : msg = null;
    res.render("auth-views/signup", {
        pageTitle: "Signup Page",
        path: "/signup",
        errorMsg: msg
    });
};

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
                        from: 'test-email@fake-domain.com',
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