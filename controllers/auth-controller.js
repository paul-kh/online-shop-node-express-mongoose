const User = require("../models/user");
exports.getLogin = (req, res, next) => {
    // We can access the session variables associated to each request through out the application
    // console.log(req.session.isLoggedIn);
    // console.log("Client's cookie:", req.session.clientCookie);

    res.render("auth-views/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false
    });
}

exports.postLogin = (req, res, next) => {
    // Create session variables and set their values
    // The variables and values will be stored in mongdb ('sessions' collection)
    // This is because we use 'connect-mongdb-session' to tell 'express-session' where to store the sessions
    // The setup was done in 'app.js'
    // req.session.isLoggedIn = true;
    // req.session.clientCookie = req.headers.cookie;
    // ... more session variables...

    // Store session variables in DB by associating the logged user
    User.findById('5fbecbf43d536c22e4c20ae8')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // Even though we don't call the 'save()' method, the session is going to stored in DB. 
            // Here we call save() because we want to redirect after saving complete
            req.session.save(err => {
                // console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    // Remove session in the DB for the current request
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/login");
    });
}