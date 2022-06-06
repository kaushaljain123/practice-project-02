const express = require('express');
const { getSingleShop, createShop, updateShop, deleteShop, updateGetOrder, getShops, getShopsInRadius, uploadShopPhoto, } = require("../controllers/shop");
const Shop = require('../models/Shop');
const advanceResult = require('../middleware/advanceResult');

// Include Resource router
const productRouter = require('./products');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource router
router.use('/:shopId/products', productRouter)
// update shop to close and open
router.route('/:id/updategetorder').put(protect, updateGetOrder)
// get shop in radius
router.route("/radius/:zipcode/:distance").get(getShopsInRadius)
//get ,create,update and delete shop
router.route("/").get(advanceResult(Shop, "products"), getShops).post(protect, authorize("vendor", "admin"), createShop)
// update, delete shop
router.route('/:id').get(getSingleShop).put(protect, updateShop).delete(protect, authorize('vendor', 'admin'), deleteShop)
// update shop photo
router.route("/:id/photo").put(protect, authorize("vendor", "admin"), uploadShopPhoto)

module.exports = router