exports.get404 = (req, res, next) => {
  res.render("404", {
    pageTitle: "Page Not Found",
    path: "/page-not-found",
    isAuthenticated: req.session.isLoggedIn,
    user: req.user.email,
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    user: req.user.email,
  });
};
