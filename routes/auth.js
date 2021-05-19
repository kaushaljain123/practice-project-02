const express = require('express');
const {
  getMe,
  updateDetails,
  getMyShop,
  loginViaOtp,
  verifyOtp,
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post("/loginviaOtp", loginViaOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/me", protect, getMe);
router.post("/myshop", protect, getMyShop);
router.put("/updatedetails", protect, updateDetails);

module.exports = router