const Express = require("express");
const path = require("path");
const app = Express();
const MONGODB_URI = "mongodb+srv://paulchheang:4fgQAeU8jo9gYsjo@cluster0.wvahj.mongodb.net/online-shop-node-express-mongoose?retryWrites=true&w=majority";
const User = require("./models/user");


// MIDDLEWARE FOR PARSING REQUEST'S BODY TO JSON FORMAT
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Setup view engine 'ejs'
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware for sending static files
app.use(Express.static(path.join(__dirname, 'public')));

/* SETUP & MANAGE SESSIONS 
===========================================================================
1-Store session in MongoDB */
const session = require("express-session"); // initialize session object ('express-session' package) for managing sessions
const storeSessionsInMongoDB = require("connect-mongodb-session")(session); // initialize a class for session mongodb storage ('connect-mongodb-session' package)
const sessionMongoDbStorage = new storeSessionsInMongoDB({ // create an instance for storing sessions in mongodb
    uri: MONGODB_URI,
    collection: "sessions"
});
/*
2-Middleware for managing session */
app.use(session({
    // 'secret' is random hashed session ID. 
    // In production env, value of 'secret' should be a long string so it's more secure - client is hard to guess.
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionMongoDbStorage
}));

// ADD CSRF PROTECTION
/* Note: csurf middleware must be written after 'body-parser' which parse form content to be readable for 'csurf'.
         Otherwise, we will get an error 'Forbidden: Invalid CSRF Token */
const csrfProtection = require("csurf")(); // import 'csurf' module & initialize
app.use(csrfProtection); // tell Express to let csrf/csurf handle token in sessions

// CREATE SESSION FOR LOGGED-IN USER
/* Add the 'user' document created by Mongoose's schema to a new property 'user' of the request object.
   This way the 'user' can be accessible through out the App. */
app.use((req, res, next) => {
    // If user has not logged in yet
    if (!req.session.user) {
        return next();
    }
    // If user already logged in
    User.findById(req.session.user._id)
        .then(user => {
            // req.user is a newly created property & it's type of Mongoose object
            // that can access all Mongoose's properties and methods.
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// FLASHING MESSAGE TO USER
/* Note: The middleware must run after the middleware that create the (user) session*/
const flashMsg = require("connect-flash"); // $npm install connect-flash
app.use(flashMsg()); // middleware to tell Express to allow flash() to use the session

// PASS GENERAL DATA TO ALL VIEWS FOR RENDERING
/*  > Create local variables & values of the 'response' object
    > Respond the variables & value to every request sent from all views 
*/
app.use((req, res, next) => {
    // Respond 'isAuthenticated' to every request
    res.locals.isAuthenticated = req.session.isLoggedIn;
    // Respond 'csrfToken' to every request
    res.locals.csrfToken = req.csrfToken();
    next();
});

// MIDDLEWARES HANDLING ROUTES
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
const authRoutes = require("./routes/auth-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
const errorController = require("./controllers/error-controller");
app.use(errorController.get404);

// DATABASE HANDLING
/*  Instantiate a mongoose object from mongoose module after installing it: $npm install --save mongoose
    Start connection to Atlas MongoDB
    Start Node server upon successul DB connection */
const mongoose = require('mongoose');
mongoose.connect(MONGODB_URI)
    .then(connectionResult => {
        // Start Node server
        app.listen(3000);
    })
    .catch(err => { console.log(err) });


