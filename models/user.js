const Sequelize = require("sequelize");

const sequelizeDB = require("../util/db-connection");

const User = sequelizeDB.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
});

module.exports = User;