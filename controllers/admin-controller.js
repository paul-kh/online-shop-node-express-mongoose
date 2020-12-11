const Product = require("../models/product");
const { validationResult } = require("express-validator");
const deleteFile = require("../util/delete-file");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.getAddProduct = (req, res, next) => {
  res.render("admin-views/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMsg: null,
    validationErrors: [],
    user: req.user.email,
  });
};

exports.postAddProduct = (req, res, next) => {
  const image = req.file;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  console.log("Image:", image);

  // Check validation results of the incoming request handled by 'express-validator'
  const validationErrors = validationResult(req);
  // console.log(validationErrors.array());
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
      user: req.user.email,
    });
  }

  // Work with image upload
  if (!image) {
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
      errorMsg: "Attached file is not an image.",
      validationErrors: [],
      user: req.user.email,
    });
  }
  if (image.size > 614399) {
    console.log("image size is too big");
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
      errorMsg: "Attached file is bigger than 600KB.",
      validationErrors: [],
      user: req.user.email,
    });
  }

  // Upload product image to AWS S3 bucket
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    // Key: `${uuid()}.${fileType}`,
    Key: Date.now() + "-" + req.file.originalname,
    Body: req.file.path,
    // Body: req.file.buffer, // memoryStorage
  };
  s3.upload(params, (error, data) => {
    if (error) return console.log(error);

    // Delete local file on the server
    deleteFile(req.file.path);

    // Add product to DB
    const product = new Product({
      title: title,
      price: price,
      imageUrl: data.Location,
      awsObjKey: data.key,
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
  });
};

exports.getProducts = (req, res, next) => {
  // To get only products that are associated with the current user,
  // we use the magic method 'User.getProducts()' created by 'Sequelize Association'
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin-views/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        user: req.user.email,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
        user: req.user.email,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

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
      user: req.user.email,
    });
  }

  Product.findById(productId)
    .then((product) => {
      // If login user doesn't matche the user who created the product
      if (product.userId.toString() != req.user._id.toString())
        return res.redirect("/");

      // If login user matches the user who created the product
      if (image) {
        // Delete old product image
        deleteFileAWS_S3(process.env.AWS_BUCKET_NAME, product.awsObjKey);

        // upload new product image
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: Date.now() + "-" + req.file.originalname,
          Body: req.file.path,
        };
        s3.upload(params, (error, data) => {
          if (error) return console.log(error);
          console.log("AWS S3 file uploaded:", data);
          // Delete local file on the server
          deleteFile(req.file.path);

          // Set new values of product attributes
          product.title = newTitle;
          product.price = newPrice;
          product.description = newDescription;
          product.imageUrl = data.Location;
          product.awsObjKey = data.key;
          product.save().then(() => {
            console.log("The product is updated successfully!");
            res.redirect("/admin/products");
          });
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  let awsObjKey;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      awsObjKey = product.awsObjKey;
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.status(200).json({ message: "Success!" });

      // Delete image from AWS S3 Bucket
      deleteFileAWS_S3(process.env.AWS_BUCKET_NAME, awsObjKey);
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting product failed." });
    });
};

// A helper function
const deleteFileAWS_S3 = (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("File Successfully Deleted from AWS S3!");
    }
  });
};
