const Express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = Express();

// Import modules for the required models
// const User = require("./models/user");
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

// Middleware for parsing request's body to json format
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Register a dummy user as a logged-in user.
// Add the sequelize's 'user' object to a new property 'user' of the request object.
// This way the 'user' can be accessible through out the App.
// app.use((req, res, next) => {
//     User.findByPk(1)
//         .then(user => {
//             // req.user is a newly created property & it's type of sequelize object
//             // that can access all sequelize's properties and methods.
//             req.user = user;
//             next();
//         })
//         .catch(err => console.log(err));
// })


// Middlewares handling routes
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
const errorController = require("./controllers/error-controller");
app.use(errorController.get404);


// DATABASE HANDLING

mongoose.connect("mongodb+srv://paulchheang:4fgQAeU8jo9gYsjo@cluster0.wvahj.mongodb.net/online-shop-node-express-mongoose?retryWrites=true&w=majority")
    .then(result => {
        console.log("MongoDB connection result: ", result);
        // Start Node server
        app.listen(3000);
    })
    .catch(err => { console.log(err) });


