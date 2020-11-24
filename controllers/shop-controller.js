const Product = require("../models/product");

exports.getHomepage = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop-views/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/'
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop-views/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.log(err);
        });
};

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