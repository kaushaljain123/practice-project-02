const express = require("express");
const {
  createProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductInRadius,
} = require("../controllers/product");
const Product = require("../models/Product");
const advanceResult = require("../middleware/advanceResult");
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, createProducts)
  .get(
    advanceResult(Product, { path: "shop", select: "name, location" }),
    getProducts
  );;
router
  .route("/:id")
  .post(getProduct)
  .put(protect, authorize("vendor", "admin"), updateProduct)
  .delete(protect, authorize("vendor", "admin"), deleteProduct);

  router.route("/productsradius").get(getProductInRadius);
module.exports = router;
