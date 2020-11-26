exports.getLogin = (req, res, next) => {
    // We can access the session variables associated to each request through out the application
    // console.log(req.session.isLoggedIn);
    // console.log("Client's cookie:", req.session.clientCookie);

    res.render("auth-views/login", {
        path: "/login",
        pageTitle: "Login"
    });
}

exports.postLogin = (req, res, next) => {
    // Create session variables and set their values
    // The variables and values will be stored in mongdb ('sessions' collection)
    // This is because we use 'connect-mongdb-session' to tell 'express-session' where to store the sessions
    // The setup was done in 'app.js'
    req.session.isLoggedIn = true;
    // req.session.clientCookie = req.headers.cookie;
    // ... more session variables...
    res.redirect("/")
}