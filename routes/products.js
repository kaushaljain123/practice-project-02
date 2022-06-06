const express = require('express')
const { uploadProductPhoto, createProducts, showCarttoUser, getProducts, getProduct, updateProduct, deleteProduct, getProductInRadius, likeProduct, unlikeProduct, downloadCSVFileForAllProduct } = require('../controllers/product')
const Product = require('../models/Product')
const advanceResult = require('../middleware/advanceResult')
const router = express.Router({ mergeParams: true })

const { protect, authorize } = require('../middleware/auth')
const store = require('../middleware/multer')

// get all catalogs
router.route('/allCatalogs').get(advanceResult(Product, { path: 'shop', select: 'name, location' }), getProducts)
// get single catalog
router.route('/catalog/:id').get(getProduct)
// Download csv data for all catalog
router.route('/downloadCSVForAllCatlogs').get(protect, downloadCSVFileForAllProduct)
//get catalog for single shop
router.route('/myCatlog/:shopId').get(protect, getProducts)
// add catalog
router.route('/addCatalog/:shopId').post(protect, createProducts)
//productinradius
router.route('/radius/:zipcode/:distance').get(getProductInRadius)
//like product
router.route('/like/:productId/:shopId').put(protect, likeProduct)
//unlike product
router.route('/unlike/:productId/:shopId').put(protect, unlikeProduct)
//getproduct, updateproduct, deleteproduct
router.route('/catalog/:id').put(protect, authorize('vendor', 'admin'), updateProduct).delete(protect, authorize('vendor', 'admin'), deleteProduct)
//uploadmultiplephoto
router.route('/photo').post(store.array([{ name: 'file', maxCount: 10 }]), uploadProductPhoto)

module.exports = router
