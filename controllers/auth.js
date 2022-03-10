const crypto = require('crypto')
const ErrorResponce = require('../utils/errorResponce');
const User = require('../models/User')
const Shop = require("../models/Shop");
const asyncHandler = require('../middleware/async');
const twilio = require("../middleware/Twilio");

// Login with OTP
exports.loginViaOtp = asyncHandler(async (req, res, next) => {
  const { role, to } = req.body;
  //@kaushal, 23-10-21, check login for salesMember in db to send otp
  if(req.body.role == 'salesMember') {
    let user = await User.find({ role, to })
    console.log(user);
    if(user.length == 0) {
      res.status(200).json({ success: false, message: "Your Number is Not Registered Yet Please Contact Your Manager!"});
    }else {
      const data = await twilio.sendVerify(to, "sms");
      res.status(200).json({ success: true, message: "OTP send Successfully!",  data: data.to });
      // res.status(200).json({ success: true, message: "OTP send Successfully!"});
      
    } 
  } else {
    const data = await twilio.sendVerify(to, "sms");
    res.status(200).json({ success: true, message: "OTP send Successfully!",  data: data.to });
    // res.status(200).json({ success: true, message: "OTP send Successfully!" });
  }
});

// Verify OTP and save number to database if not exists
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { to, code, role } = req.body;

  const data = await twilio.verifyCode(to, code, role);

  let user = await User.findOne({ to });
  if (data.valid == true) {
    
    if (user) {
      // Create token
      sendTokenResponse(user, 200, res);
    } else {
      user = await User.create(req.body);
      // Create token
      sendTokenResponse(user, 200, res);
    }
  } else {
    res.status(401).json({ success: true, message: "OTP is not valid" });
  }
});

// Add Profile
exports.addProfile = asyncHandler(async (req, res, next) => {
  const profile = ({ name, email, avatar } = req.body);

  const user = await User.findByIdAndUpdate(req.user.id, profile, {
    new: true,
    runValidators: true,
  });

  

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @dec         Get Current Logged in User
//@route        POST /api/v1/auth/me
//@access       Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success : true,
      data : user
    })
})

// @dec         Get Current Logged in User Shop
//@route        POST /api/v1/auth/myshop
//@access       Private
exports.getMyShop = asyncHandler(async (req, res, next) => {
  const myShop = await Shop.findOne({ user: req.user.id });

  res.status(200).json({ success: true, data: myShop });
});

// @dec         Update user Details
//@route        POST /api/v1/auth/updatedetails
//@access       Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Get token from model, create cookie and send responce
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

