exports.get404 = (req, res, next) => {
    res.render("shop-views/404", {
        pageTitle: "Page Not Found",
        path: "/page-not-found",
        isAuthenticated: req.session.isLoggedIn
    });
}