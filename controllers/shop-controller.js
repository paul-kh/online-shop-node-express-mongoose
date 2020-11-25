const Product = require("../models/product");
const { getProducts } = require("./admin-controller");

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
                path: '/products',
                prods: products
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
            res.render('shop-views/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    // Get productId sent via a hidden input in the request form
    const productId = req.body.productId;
    // To make cart/fetchedCart accessible in this postCart function
    let fetchedCart;
    let newProdQty = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            // If product exists in the cart, get old quantity + 1
            if (product) {
                const oldProdQty = product.cartItem.quantity; // is made possible by association
                newProdQty = oldProdQty + 1;
                return product;
            }

            // If product doesn't exist in the cart, find product from the general 'Product' table
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newProdQty }
            });
        })
        .then((product) => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    res.render("shop-views/orders", {
        pageTitle: "Orders",
        path: "/orders"
    });
}