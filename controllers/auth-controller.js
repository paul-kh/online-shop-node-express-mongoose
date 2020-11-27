const User = require("../models/user");
const bcrypt = require("bcryptjs");
exports.getLogin = (req, res, next) => {
    // We can access the session variables associated to each request through out the application
    // console.log(req.session.isLoggedIn);
    // console.log("Client's cookie:", req.session.clientCookie);
    res.render("auth-views/login", {
        path: "/login",
        pageTitle: "Login",
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
            if (!foundUser) return res.redirect("/login");
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
    res.render("auth-views/signup", {
        pageTitle: "Signup Page",
        path: "/signup",
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Check if email already exists
    User.findOne({ email: email })
        .then(foundUser => {
            if (foundUser) return res.redirect("/signup");
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
                })
                .catch(err => console.log(err));
        })
        .catch(err => { console.log(err) });
}