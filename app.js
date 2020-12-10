const Express = require("express");
const path = require("path");
const app = Express();
// const dotenv = require("dotenv");
// dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.wvahj.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;

const User = require("./models/user");

// Middleware for sending static files
app.use(Express.static(path.join(__dirname, "public")));
app.use("/images", Express.static(path.join(__dirname, "images")));

// PARSING INCOMING REQUEST'S FORM BODY CONTENT TYPE = TEXT
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

//===========================================================

// Handle product image upload using 'multer'
// const uploadProductImage = require("./util/upload-product-image")(app, "image");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
  // filename: (req, file, cb) => {
  //   const date = new Date();
  //   cb(null, Date.now() + "-" + file.originalname);
  // },
});

// Filter file type
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Multer Upload settings
// const upload = multer ({dest: "images"});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 6143400 }, // limit max 600KB * 1024
}).single("image");

app.use(upload);

// =================================

// Setup view engine 'ejs'
app.set("view engine", "ejs");
app.set("views", "views");

// SETUP & MANAGE SESSIONS
/* Notes: - The 'express-session' creates a session object with randomly hashed key sent as a session cookie
            to be stored at the client's browser. It's hard for the client/user to guess what the real value of the hashed/secret key is.
          - By default, the 'express-session' create and store the 'session' object in the server's memory.
          - The 'connect-mongdb-session' adds to MongoDB the 'session' object created by the 'express-session */
const session = require("express-session");
const storeSessionsInMongoDB = require("connect-mongodb-session")(session);
const sessionMongoDbStorage = new storeSessionsInMongoDB({
  uri: MONGODB_URI,
  collection: "sessions",
});
app.use(
  session({
    // The value of 'secret' key will be randomly hashed to be session cookie ID sent and stored at the client side
    // In production env, value of 'secret' should be a long string so it's more secure
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionMongoDbStorage,
  })
);

// ADD CSRF PROTECTION
/* Notes: - The csurf middleware must be written after 'body-parser' which parse form content to be readable for 'csurf'.
          - Otherwise, we will get an error 'Forbidden: Invalid CSRF Token */
const csrfProtection = require("csurf")(); // import 'csurf' module & initialize
app.use(csrfProtection); // tell Express to let csrf/csurf handle token in sessions

// ASSIGN THE LOGGED-IN USER AS VALUE OF 'req.user' TO BE ACCESSIBLE ANYWHERE IN THE APP
/* Note: When we assign a Mongoose's document object to the 'req.user' then it will become a Mongoose's document boject
         so it can use all properties and methods of Mongoose's document object */
app.use((req, res, next) => {
  // If user has not logged in yet
  if (!req.session.user) {
    return next();
  }
  // If user already logged in
  User.findById(req.session.user._id)
    .then((user) => {
      // 'req.user' will be able to inherit all properties and method of the Mongoose's document objet
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// FLASH [ERROR] MESSAGE TO USER
/* Notes: - The middleware must run after the middleware that create the (user) session.
          - The Flash message will be removed from the 'session' object after it's sent to the view */
const flashMsg = require("connect-flash");
app.use(flashMsg()); // Tell Express to allow flash() to connect to / use the session

// PASS GENERIC DATA TO ALL VIEWS FOR RENDERING - "res.render()"
/* Notes: - Any property created for 'res.locals' will be accessible by all request objects anywhere in the app.
          - This kind of property will be passed to all render views using 'res.render() */
app.use((req, res, next) => {
  // Pass 'isAuthenticated' to all render views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // Pass 'csrfToken' to all render views
  res.locals.csrfToken = req.csrfToken();
  next();
});

// SET SECURE RESPONSE HEADERS WITH 'helmet'
// const helmet = require("helmet");
// app.use(helmet());

// SET FILE COMPRESSION FOR ASSET FILES - 'compression'
// const compression = require("compression");
// app.use(compression());

// MIDDLEWARES HANDLING ROUTES
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
const authRoutes = require("./routes/auth-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

const errorController = require("./controllers/error-controller");
// // Route for 500 - server error
app.get("/500", errorController.get500);
// Route for 404 - page not found error
app.use(errorController.get404);

// GLOBAL ERROR HANDLINGS with app.use(err, req, res, next)
/*  The express middleware below can catch any error thrown by anywhere in the App.
    For the middleware to be able to catch the error, our codes need to be:
     - Synchronous code: throw new Error("dummy Error")
     - Asyn. code: .catch(err => { next(new Error(err))});
        Note: In asyn. code, 'throw new Error(err)' will not be caught by the express middle 'app.use(err, req, res, next)' */
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).redirect("/500");
});

// SETUP DATABASE CONNECTION AND START NODE SERVER
const mongoose = require("mongoose");
mongoose
  .connect(MONGODB_URI)
  .then((connectionResult) => {
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
