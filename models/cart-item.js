// CartItem is a joint table between Cart & Product through CartId and ProductId
// It has an extra field 'quantity' which refers to product's quantity added to the cart


const Sequelize = require('sequelize');

const sequelize = require('../util/db-connection');

const CartItem = sequelize.define('cartItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});

module.exports = CartItem;
