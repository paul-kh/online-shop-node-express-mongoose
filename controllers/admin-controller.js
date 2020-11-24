const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render("admin-views/add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
}

exports.getProducts = (req, res, next) => {
    res.render("admin-views/products", {
        pageTitle: "Admin Products",
        path: "/admin/products"
    });
}