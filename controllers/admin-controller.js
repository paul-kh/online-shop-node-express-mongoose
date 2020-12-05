const Product = require("../models/product");
const user = require("../models/user");
const { validationResult } = require("express-validator");
const deleteFile = require("../util/delete-file");

// GET '/admin/add-product
exports.getAddProduct = (req, res, next) => {
  res.render("admin-views/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMsg: null,
    validationErrors: [],
  });
};

// POST '/admin/add-product
exports.postAddProduct = (req, res, next) => {
  const image = req.file;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;

  // Check validation results of the incoming request handled by 'express-validator'
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("admin-views/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMsg: validationErrors.array()[0].msg,
      validationErrors: validationErrors.array(),
    });
  }

  // Work with image upload
  // console.log("image:", image);
  // if (!image) {
    return res.status(422).render("admin-views/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }
  const imageUrl = image.path;

  // Add product to DB
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user, // Mongoose will map 'req.user' = 'req.user_id'
  });

  // Save newly created document
  product
    .save()
    .then((p) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Show admin's product list => GET '/admin/products
exports.getProducts = (req, res, next) => {
  // Product.findAll()
  // To get only products that are associated with the current user,
  // we use the magic method 'User.getProducts()' created by 'Sequelize Association'
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin-views/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Render product edit form => GET '/admin/edit-product
exports.getEditProduct = (req, res, next) => {
  // Get the 'edit' param sent via url from the client -  url: /admin/edit-product/id?edit=true'
  const isEditing = req.query.edit;
  if (!isEditing) return res.redirect("/");

  // Get the 'productId' passed by the router - /admin/edit-product/:productId
  const productId = req.params.productId;

  // Find product with the given ID sent via query params in url
  // The power of Sequelize Association made the method 'User.getProducts({where: {...}})
  // available. So we can get only product that related to this user - (SELECT ..JOIN..)
  Product.findById(productId)
    .then((product) => {
      // If no product match for the given ID, redirect to home page
      if (!product) return res.redirect("/");
      // If product found
      res.render("admin-views/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        product: product,
        editing: isEditing, // for customizing the form to be in 'edit' mode or 'add new' mode
        product: product,
        hasError: false,
        errorMsg: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Update the edited product in DB => POST '/admin/edit-product/'
exports.postEditProduct = (req, res, next) => {
  // Get values of all the form fields sent via POST request
  const productId = req.body.productId; // This was sent via a hidden input/form control named 'productId' in the view 'edit-product.ejs'
  const newTitle = req.body.title;
  const newDescription = req.body.description;
  const newPrice = req.body.price;
  const image = req.file;

  // Check validation results of user input
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render("admin-views/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: newTitle,
        price: newPrice,
        description: newDescription,
        _id: productId,
      },
      errorMsg: validationErrors.array()[0].msg,
      validationErrors: validationErrors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      // If login user doesn't matche the user who created the product
      if (product.userId.toString() != req.user._id.toString())
        return res.redirect("/");

      // If login user matches the user who created the product
      product.title = newTitle;
      product.price = newPrice;
      product.description = newDescription;
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save(); // save to DB
    })
    .then((result) => {
      console.log("The product is updated successfully!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Delete a product => POST '/admin/delete'
exports.postDeleteProduct = (req, res, next) => {
  // Get product ID from the hidden input form control in the view 'products.ejs'
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) return next(new Error("Product not found."));
      return Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(() => {
          // Delete product's image file
          deleteFile(product.imageUrl);
          res.redirect("/admin/products");
        })
        .catch((err) => next(err));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
