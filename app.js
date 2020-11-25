const Express = require("express");
const path = require("path");

const app = Express();

// Import modules for the required models
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

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
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            // req.user is a newly created property & it's type of sequelize object
            // that can access all sequelize's properties and methods.
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})


// Middlewares handling routes
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
const errorController = require("./controllers/error-controller");
app.use(errorController.get404);

// Associations between sequelize models / table relationships
// * User & Product: one-to-many
Product.belongsTo(User, { constraint: true, onDelete: 'CASCADE' })
User.hasMany(Product); // optional for reverse
// * User & Cart: one-to-one
User.hasOne(Cart);
Cart.belongsTo(User);
// * Cart & Product: many-to-many
Cart.belongsToMany(Product, { through: CartItem }); // CartItem is the joint table
Product.belongsToMany(Cart, { through: CartItem });


// DATABASE HANDLING
// * Sync models to the DB 
// * Create a dummy user with ID=1 since user login & authentication will be implemented later
// * Start up Node Server only when DB sync is successful
const sequelizeDB = require("./util/db-connection");
sequelizeDB
    // .sync({ force: true })
    .sync()
    .then(result => {
        // console.log(result);

        // When syncing db, if user with ID=1 exists, return result for next promise
        return User.findByPk(1);

    })
    .then(user => {
        // If user is null, create a new user then retrun user object
        if (!user) return User.create({ name: 'Paul', email: 'paul@test.com' });
        // If user exists, return user object
        return user;
    })
    .then(user => {
        // console.log(user);
        // Start the server at port 3000 upon successful sync to DB
        app.listen(3000);
    })
    .catch(error => console.log(error));

