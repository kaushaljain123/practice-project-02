
//shubham
const mongoose = require('mongoose');
 
const CartSchema = new mongoose.Schema({
 
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
 
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  

  addAt: {
    type: Date,
    default: Date.now,
  },


});
 


module.exports = mongoose.model('Cart', CartSchema);