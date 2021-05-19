const crypto = require('crypto')
const ErrorResponce = require('../utils/errorResponce');
const User = require('../models/User')
const Shop = require("../models/Shop");
const asyncHandler = require('../middleware/async');
const sendEmail = require("../utils/sendEmail");
const twilio = require("../middleware/Twilio");

// @dec         Register a user
//@route        GET /api/v1/auth/register
//@access       Public
exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role, number } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorResponce("Email Alreay Exists", 401));
    }

    user = await User.findOne({ number });

    if(user) {
      return next(new ErrorResponce("Number Already Exists", 401));
    }
    // Create User
     user = await User.create({
        name,
        email,
        password,
        role,
        number,
      });

    // Create token
    sendTokenResponse(user, 200, res)
})


// @dec         Login User
//@route        GET /api/v1/auth/login
//@access       Public
exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    // Validation email and password
    if(!email || !password) {
        return next(new ErrorResponce('Please provide an email and password', 400))
    }

    // check for user
    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return next(new ErrorResponce('Invalid credentails', 401));
    }

    // check if password matches
    const isMatch = await user.matchPassword(password)

    if(!isMatch) {
        return next(new ErrorResponce('Invalid credentails', 401))
    }
    // Create token
    sendTokenResponse(user, 200, res)
})


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


// @dec         Forgot Password
//@route        POST /api/v1/auth/forgotpassword
//@access       Public
exports.forgotpassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponce("There is no User with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please Click on the Link it is Valid 
  only 10 Minutes: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponce('Email could not be sent', 500));
  }
});


// @dec         Reset Password
//@route        PUT /api/v1/auth/resetpassword/:resettoken
//@access       Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponce("Invalid Token", 400));
  }

  // Set new Password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
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

// @dec         Update Password
//@route        POST /api/v1/auth/updatepassword
//@access       Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponce("Password is Incorrect ", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});


// Login with OTP
exports.loginViaOtp = asyncHandler(async (req, res, next) => {

  const { role, to } = req.body;
  
  const data = await twilio.sendVerify(to, 'sms');

  console.log(data)
})

// Verify OTP and save number to database if not exists

exports.verifyOtp = asyncHandler(async (req, res, next) => {

  const { to, code } = req.body

  data = await twilio.verifyCode(to, code)


  let user = await User.findOne({ to })

  
  // res.status(200).json({ success : true, message : 'login SuccessFully !' })

  // Create token
  // sendTokenResponse(user, 200, res)


      if(data.valid === true) {
        if(user) {
            // res.status(200).json({ success : true, message : 'login SuccessFully !' })

        // Create token
        sendTokenResponse(user, 200, res)
        } else {
          user = await User.create(req.body)

          if(user) {
            
          // res.status(200).json({ success : true, message : 'Signup SuccessFully !' })

          // Create token
          sendTokenResponse(user, 200, res)
          } else {
            res.status(401).json({ success : true, message : 'Something went wrong!' })
          }
        }
      } else {
        res.status(401).json({ success : true, message : 'OTP is not valid' })
      }

 
})


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

