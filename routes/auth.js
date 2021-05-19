const express = require('express');
const {
  register,
  login,
  getMe,
  forgotpassword,
  resetPassword,
  updateDetails,
  updatePassword,
  getMyShop,
  loginViaOtp,
  verifyOtp,
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login)
router.post("/me", protect, getMe);
router.post("/myshop", protect, getMyShop);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotpassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.post("/loginviaOtp", loginViaOtp);
router.post("/verifyOtp", verifyOtp);

module.exports = router