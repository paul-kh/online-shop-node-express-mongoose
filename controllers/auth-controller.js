exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn);
    res.render("auth-views/login", {
        path: "/login",
        pageTitle: "Login"
    });
}

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true'); // client can manipulate the cookie value
    req.session.isLoggedIn = true;
    res.redirect("/")
}