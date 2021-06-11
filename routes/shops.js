const express = require('express');
const {
  getShop,
  createShop,
  updateShop,
  deleteShop,
  updateGetOrder,
  getshops,
  showNotification,
  getShopsInRadius,
  uploadShopPhoto,
} = require("../controllers/shop");
const Shop = require('../models/Shop');
const advanceResult = require('../middleware/advanceResult');

// Include Resource router
const productRouter = require('./products');
const subscriptionRouter = require('./subscription');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource router
router.use('/:shopId/products', productRouter)
router.use('/:shopId/subscription', subscriptionRouter)
router.route('/:id/updategetorder').put(protect, updateGetOrder)
router.route('/:id/notifiation').get(showNotification)


router
.route("/radius/:zipcode/:distance")
.get(getShopsInRadius),
  router
    .route("/")
    .get(advanceResult(Shop, "products"), getshops)
    .post(protect, authorize("vendor", "admin"), createShop);
router.route('/:id').get(getShop).put(protect, updateShop).delete(protect, authorize('vendor', 'admin'), deleteShop)
router
  .route("/:id/photo")
  .put(protect, authorize("vendor", "admin"), uploadShopPhoto);

module.exports = router