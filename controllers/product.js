const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const Shop = require('../models/Shop');
const geocoder = require('../utils/geocoder');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const multer =require('multer');
const { fstat } = require('fs');
const { callbackPromise } = require('nodemailer/lib/shared');


// @dec         Get all Products
//@route        GET /api/v1/products
//@access       Public
exports.getProducts = asyncHandler (async (req, res, next) => {
    if(req.params.shopId) {
        const products = await Product.find({ shop : req.params.shopId });
    
        return res.status(200).json({ success : true, count : products.length, data : products })
    } else {
     res.status(200).json(res.advanceResult);
    }
})

// @dec         Get product within a radius
//@route        DELETE /api/v1/shops/:zipcode/:distance
//@access       Public
// create by shubham



exports.getProductInRadius = asyncHandler( async (req, res, next) => {

  const { zipcode, distance } = req.params

  // get lat/lug from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // calc radius using radius
  // Divide dist by radius of Earth
  // Earth Radius = 6,378 km

  const radius = distance / 6378 // in km

  const shops = await Shop.find({ 
    location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } } },{id:1}) 
     
    const products = await Product.find({ 
      shop: shops            //take id of shops in json formate
    }) 
       
   res.status(200).json({ success : true, count : products.length, data : products })


})

// @dec         Create Products
//@route        POST /api/v1/products
//@access       Private
exports.createProducts = asyncHandler (async (req, res, next) => {
  req.body.shop = req.params.shopId;
  req.body.user = req.user.id;

  const shop = await Shop.findById(req.params.shopId);

  if (!shop) {
    return next(
      new ErrorResponce(
        `No Shop found to add products on this ${req.params.shopId} id`
      )
    );
  }
  
  // Make Sure user is product owner
  if (shop.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to add Products`,
        404
      )
    );
  }

  const product = await Product.create(req.body);

  res.status(201).json({ success: true, data: product });
})

// @dec         Get single Products
//@route        Get /api/v1/products/:id
//@access       Private
exports.getProduct = asyncHandler (async (req, res, next) => {
    const product = await Product.findById(req.params.id) ;

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({ success : true, data : product })
})

// @dec         Update Products
//@route        PUT /api/v1/products/:id
//@access       Private
exports.updateProduct = asyncHandler (async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`))
    }

      // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Update Products`,
        404
      )
    );
  }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    })

    res.status(200).json({ success : true, data : product })

})

// @dec         Delete Products
//@route        Delete /api/v1/products/:id
//@access       Private
exports.deleteProduct = asyncHandler (async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if(!product) {
        return next(new ErrorResponce(`Product not found with this id ${req.params.id}`))
    }


          // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Delete Products`,
        404
      )
    );
  }

    product = await Product.findByIdAndRemove(req.params.id)

    res.status(200).json({ success : true, msg : 'Product Delete Successfully!' })
})


// @dec         Upload photo for bootcamp
//@route        DELETE /api/v1/products/:id/photo
//@access       Privaet
exports.uploadProductPhoto = asyncHandler (async (req, res, next) => {

if(!req.files){
  const error= new Error('please choose files')
  error.httpStatusCode =400;
  return next(error)
}

  if(req.files){
    console.log(req.files)

    console.log("files uploaded")
}

res.json(req.files)

  
})