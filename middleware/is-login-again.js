// This middleware is for protecting if a user is logged in and is trying
// to login again by entering the url '/login'

module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/");
    }
    next();
}