const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const order = require("../models/order");
const deleteFile = require("../util/delete-file");

// Number of products to show per page - Pagination
const ITEMS_PER_PAGE = 3;

// Homepage (index.ejs) => GET '/'
exports.getHomepage = (req, res, next) => {
  showProducts(req, res, next, {
    renderView: "shop-views/product-list",
    viewPath: "/",
    pageTitle: "Home Page",
    ITEMS_PER_PAGE: ITEMS_PER_PAGE,
  });
};
// Product list => GET '/products'
exports.getProducts = (req, res, next) => {
  showProducts(req, res, next, {
    renderView: "shop-views/product-list",
    viewPath: "/products",
    pageTitle: "Shop Products",
    ITEMS_PER_PAGE: ITEMS_PER_PAGE,
  });
};

// Product Details  => GET '/product/:productId'
exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then((product) => {
      res.render("shop-views/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        user: req.user ? req.user.email : "",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Show products in the cart => GET '/cart'
exports.getCart = (req, res, next) => {
  req.user
    // Fetch all the related fields of the product from the 'products' collection
    // Because we need 'title' of the product.
    .populate("cart.items.productId")
    .execPopulate() // to make .populate() return a promise for the then bolck
    .then((user) => {
      const products = user.cart.items;
      res.render("shop-views/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        user: req.user ? req.user.email : "",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Add a product to the cart => POST '/cart'
exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((foundProduct) => {
      return req.user.addToCart(foundProduct);
    })
    .then((resultOfPostCart) => {
      // console.log("PostCart result: ", resultOfPostCart);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Delete a product/item from the cart => POST '/cart-delete-item'
exports.postCartDeleteProduct = (req, res, next) => {
  // Get productId from a hidden input in the request form
  const productId = req.body.productId;
  req.user
    .deleteCartItem(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Place an order for the products in the cart => POST '/orders'
exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return { quantity: item.quantity, product: { ...item.productId } };
        // return { quantity: item.quantity, product: { ...item.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Show order information => GET '/orders'
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop-views/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        user: req.user ? req.user.email : "",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  // Only authorized user can access the invoice
  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error("No order found."));
      if (order.user.userId.toString() !== req.user._id.toString())
        return next(new Error("Unauthorized"));
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });

      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();
      // Delete invoice file from the server
      deleteFile(invoicePath);
    })
    .catch((err) => next(err));

  /* READ LOCAL FILE AND RESPOND IT TO CLIENT
      // Read file in a streaming mode
      const file = fs.createReadStream(invoicePath);
      // Tell browser about file/content type
      res.setHeader("Content-Type", "application/pdf");
      // Tell browser how to serve the file: 'attachment' or 'inline' (open file in the browser)
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      // Stream/respond the file to client
      file.pipe(res);
    })
    .catch((err) => next(err));
    */
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "usd",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success", // => http://localhost:3000
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop-views/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        user: req.user ? req.user.email : "",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Function rendering product list
const showProducts = (
  req,
  res,
  next,
  {
    renderView: viewName,
    viewPath: path,
    pageTitle: title,
    ITEMS_PER_PAGE: ITEMS_PER_PAGE,
  }
) => {
  const page = +req.query.page || 1;
  let totalItems;
  // Include pagination logics
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render(viewName, {
        prods: products,
        pageTitle: title,
        path: path,
        user: req.user ? req.user.email : "",
        currentPage: page,
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
