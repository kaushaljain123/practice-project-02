const express = require("express");
const {
  createProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductInRadius,
} = require("../controllers/product");
const{ createChatroom,
  chatroomMessage,
  productChatroom,
}=require("../controllers/chatroom")
const Product = require("../models/Product");
const advanceResult = require("../middleware/advanceResult");
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, createProducts)
  .get(
    advanceResult(Product, {
      path: "shop",
      select: "name, location",
    }),
    getProducts
  );
  router.route("/radius/:zipcode/:distance").get(getProductInRadius),
  router.route("/:id/:shopId").post(createChatroom),
  router.route("/:id/:shopId/chatroom/:chatId").post(productChatroom),
  router.route("/:id/:shopId/chatroom/:chatId").get(chatroomMessage),

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("vendor", "admin"), updateProduct)
  .delete(protect, authorize("vendor", "admin"), deleteProduct);

module.exports = router;
