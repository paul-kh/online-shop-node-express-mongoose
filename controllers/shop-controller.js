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

    req.user.getCart()
        .then(cart => {
            // console.log(cart);
            return cart.getProducts();
        })
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    res.render("shop-views/orders", {
        pageTitle: "Orders",
        path: "/orders"
    });
}