const Sequelize = require("sequelize");

// Instantiate a sequelize to handle works with database
const sequelizeDB = new Sequelize("online-shop-node-express-sequelize", "root", "root", {
    dialect: "mysql",
    host: "localhost"
});

module.exports = sequelizeDB;