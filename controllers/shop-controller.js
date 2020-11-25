const Product = require("../models/product");
const Order = require("../models/order");

exports.getHomepage = (req, res, next) => {
    Product.find()
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
    Product.find()
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

exports.getProduct = (req, res, next) => {
    Product.findById(req.params.productId)
        .then(product => {
            console.log(product.title);
            res.render("shop-views/product-detail", {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
        .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user
        // Fetch all the related fields of the product from the 'products' collection
        // Because we need 'title' of the product.
        .populate('cart.items.productId')
        .execPopulate() // to make .populate() return a promise for the then bolck
        .then(user => {
            const products = user.cart.items;
            console.log('User.cart.items: ', products);
            res.render('shop-views/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(foundProduct => {
            return req.user.addToCart(foundProduct);
        })
        .then(resultOfPostCart => {
            // console.log("PostCart result: ", resultOfPostCart);
            res.redirect("/cart");
        })
        .catch(err => { console.log(err) });
}
// Delete an item from cart => POST '/cart-delete-item'
exports.postCartDeleteProduct = (req, res, next) => {
    // Get productId from a hidden input in the request form
    const productId = req.body.productId;
    req.user.deleteCartItem(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: { ...item.productId } };
                // return { quantity: item.quantity, product: { ...item.productId._doc } };
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(() => req.user.clearCart())
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop-views/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};