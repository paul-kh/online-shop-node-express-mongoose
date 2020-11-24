const Express = require("express");
const path = require("path");

const app = Express();


// Setup view engine 'ejs'
app.set('view engine', 'ejs');
app.set('views', 'views');


// Middleware for sending static files
app.use(Express.static(path.join(__dirname, 'public')));

// Middleware for parsing request's body to json format
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

/* Middlewares handling routes ****
***********************************/
// import route modules
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
const errorController = require("./controllers/error-controller");
app.use(errorController.get404);


// Start the server at port 3000
app.listen(3000);