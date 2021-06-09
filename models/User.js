const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  to: {
    type: String,
    required: [true, "Please add number"],
  },

  role: {
    type: String,
    enum: ["user", "vendor", "sales", "admin", "superadmin"],
    default: "user",
  },

  name: {
      type: String,
    },

  email: {
      type: String,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    adhaarNumber: {
      type: Number,
      length: [12, "Addhar no is 12 digit"],
    },

  avatar: {
      type: String,
      default: "no-photo.jpg",
    },
    
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
 
module.exports = mongoose.model("User", UserSchema);
