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
