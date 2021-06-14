const express = require("express");
const { getSales, 
        getSale,
        updateSales,
        deleteSales,
        createSales,
        getSalesInRadius
      } = require("../controllers/sale");

const router = express.Router();
const Sale = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

//get product in location wise
router.route("/radius/:zipcode/:distance").get(getSalesInRadius)
//getsale sales
router.route("/").get(getSales);
//create sales
router.route("/createsales").post(createSales)
//getsale, update sale,deletesale by id
router.route("/:id").get(getSale).put(updateSales).delete(deleteSales);
      
module.exports = router;
      
 
 