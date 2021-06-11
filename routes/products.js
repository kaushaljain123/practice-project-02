const express = require("express");
const {addtoCart,
  sendNotification,
  uploadProductPhoto,
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
const store = require('../middleware/multer');

router
  .route("/")
  .post(protect, createProducts)
  .get(

    advanceResult(Product, { path: "shop", select: "name, location" }),
    getProducts

  );
  router.route("/radius/:zipcode/:distance").get(getProductInRadius),

  router.route("/:id/:shopId").post(createChatroom),
  router.route("/:id/:shopId/chatroom/:chatId").post(productChatroom),
  router.route("/:id/:shopId/chatroom/:chatId").get(chatroomMessage),

  router.route("/:id/:shopId/addtocart").post(addtoCart),


router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("vendor", "admin"), updateProduct)
  .delete(protect, authorize("vendor", "admin"), deleteProduct);
  
router
.route("/photo").post(store.array([{ name: 'file', maxCount: 10 }]),
   uploadProductPhoto);


module.exports = router;

  router.route("/productsradius").get(getProductInRadius);
module.exports = router;

