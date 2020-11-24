const Product = require("../models/product");

// Send form for adding new product for GET '/admin/add-product
exports.getAddProduct = (req, res, next) => {
    res.render("admin-views/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product"
    });
}

// Receive POST req for adding new product, and save it in DB - POST '/admin/add-product
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

// Send all products for GET '/admin/products
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


// Send form for editing a product - GET '/admin/edit-product
exports.getEditProduct = (req, res, next) => {
    // Get the 'edit' param sent via url from the client -  url: /admin/edit-product/id?edit=true'
    const isEditing = req.query.edit;
    if (!isEditing) return res.redirect("/");

    // Get the 'productId' passed by the router - /admin/edit-product/:productId
    const productId = req.params.productId;

    // Find product with the given ID sent via query params in url
    Product.findByPk(productId)
        .then(
            product => {
                // If no product match for the given ID, redirect to home page
                if (!product) return res.redirect("/");

                // If product found, render edit form
                res.render("admin-views/edit-product", {
                    pageTitle: "Edit Product",
                    path: "/admin/edit-product",
                    product: product,
                    editing: isEditing // for customizing the form to be in 'edit' mode or 'add new' mode
                });

            }
        )
        .catch(err => console.log(err));
}

// Receive POST req for editing a product, and update it in DB - POST '/admin/edit-product/'
exports.postEditProduct = (req, res, next) => {
    // Get values of all the form fields sent via POST request
    const productId = req.body.productId; // This was sent via a hidden input/form control named 'productId' in the view 'edit-product.ejs'
    const newTitle = req.body.title;
    const newDescription = req.body.description;
    const newPrice = req.body.price;
    const newImageUrl = req.body.imageUrl;
    Product.findByPk(productId)
        .then(product => {
            product.title = newTitle;
            product.price = newPrice;
            product.description = newDescription;
            product.imageUrl = newImageUrl;
            return product.save(); // save to DB
        })
        .then(result => {
            console.log("The product is updated successfully!")
            res.redirect("/admin/products");
        })
        .catch(err => console.log(err));
}