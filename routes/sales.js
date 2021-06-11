const express = require("express");
const { getSales, getSale, updateSales, deleteSales, createSales, getSalesInRadius} = require("../controllers/sale");

const router = express.Router();
const Sale = require("../models/User");
const advanceResult = require("../middleware/advanceResult");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.route("/radius/:zipcode/:distance").get(getSalesInRadius)
router.route("/").get(advanceResult(Sale), getSales).post(createSales);
router.route("/:id").get(getSale).put(updateSales).delete(deleteSales);
      
module.exports = router;
      
 
 