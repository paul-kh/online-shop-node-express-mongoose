const Express = require("express");
const path = require("path");

const app = Express();


// Setup view engine 'ejs'
app.set('view engine', 'ejs');
app.set('views', 'views');


// Middleware for sending static files
app.use(Express.static(path.join(__dirname, 'public')));

/* Middlewares handling routes ****
***********************************/
// import route modules
const adminRoutes = require("./routes/admin-routes");
const shopRoutes = require("./routes/shop-routes");
app.use("/admin", adminRoutes);
app.use(shopRoutes);


// Start the server at port 3000
app.listen(3000);