const Express = require("express");
const path = require("path");
const app = Express();
const MONGODB_URI = "mongodb+srv://paulchheang:4fgQAeU8jo9gYsjo@cluster0.wvahj.mongodb.net/online-shop-node-express-mongoose?retryWrites=true&w=majority";

// Import modules for the required models
const User = require("./models/user");
// const Product = require("./models/product");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

// Setup view engine 'ejs'
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware for sending static files
app.use(Express.static(path.join(__dirname, 'public')));

// SETUP & MANAGE SESSIONS //
// ============================================
// * Store session in MongoDB
const session = require("express-session"); // initialize session object ('express-session' package) for managing sessions
const storeSessionsInMongoDB = require("connect-mongodb-session")(session); // initialize a class for session mongodb storage ('connect-mongodb-session' package)
const sessionMongoDbStorage = new storeSessionsInMongoDB({ // create an instance for storing sessions in mongodb
    uri: MONGODB_URI,
    collection: "sessions"
});

// * Middleware for managing session
app.use(session({
    // 'secret' is random hashed session ID. 
    // In production env, value of 'secret' should be a long string so it's more secure - client is hard to guess.
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionMongoDbStorage
}));
// ==================================================


// Middleware for parsing request's body to json format
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Register a dummy user as a logged-in user.
// Add the 'user' document created by Mongoose's schema to a new property 'user' of the request object.
// This way the 'user' can be accessible through out the App.
app.use((req, res, next) => {
    User.findById("5fbecbf43d536c22e4c20ae8")
        .then(foundUser => {
            // req.user is a newly created property & it's type of Mongoose object
            // that can access all Mongoose's properties and methods.
            req.user = foundUser;
            next();
        })
        .catch(err => console.log(err));
})

// Middlewares handling routes
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
const authRoutes = require("./routes/auth-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Handle 404
const errorController = require("./controllers/error-controller");
app.use(errorController.get404);

// DATABASE HANDLING
// ======================================================================================================
// * Instantiate a mongoose object from mongoose module after installing it: $npm install --save mongoose
// * Start connection to Atlas MongoDB
// * Start Node server upon successul DB connection
const mongoose = require('mongoose');
mongoose.connect(MONGODB_URI)
    .then(connectionResult => {
        // Create one user (dummy) if no user exists in the 'users' collection
        User.findOne()
            .then(foundUser => {
                if (!foundUser) {
                    const user = new User({
                        name: "Paul",
                        email: "paul@test.com",
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            });
        // Start Node server
        app.listen(3000);
    })
    .catch(err => { console.log(err) });


