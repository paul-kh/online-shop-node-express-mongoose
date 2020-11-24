const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render("admin-views/add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
}

exports.getProducts = (req, res, next) => {
    Product.findAll().
        then(products => {
            res.render('admin-views/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    Product.create({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    })
        .then(result => {
            // console.log(result);
            console.log('Created Product');
        })
        .catch(err => {
            console.log(err);
        });
};