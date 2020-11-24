const Express = require("express");
const path = require("path");

const app = Express();


// Setup view engine 'ejs'
app.set('view engine', 'ejs');
app.set('views', 'views');


// Middleware for sending static files
app.use(Express.static(path.join(__dirname, 'public')));

// Middlewares
app.use("/", (req, res, next) => {
    res.render('index', {
        pageTitle: "Home Page",
        path: "/"
    });
});


// Start the server at port 3000
app.listen(3000);