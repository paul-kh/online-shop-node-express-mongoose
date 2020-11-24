const Product = require("../models/product");

exports.getHomepage = (req, res, next) => {
    res.render("shop-views/index", {
        pageTitle: "Home Page",
        path: "/"
    });
}

exports.getProducts = (req, res, next) => {
    res.render("shop-views/product-list", {
        pageTitle: "Shop Products",
        path: "/products"
    });
}

exports.getCart = (req, res, next) => {
    res.render("shop-views/cart", {
        pageTitle: "Cart",
        path: "/cart"
    });
}

exports.getOrders = (req, res, next) => {
    res.render("shop-views/orders", {
        pageTitle: "Orders",
        path: "/orders"
    });
}