const ErrorResponce = require('../utils/errorResponce')
const Shop = require('../models/Shop')
const Payment = require('../models/Payment')
const geocoder = require('../utils/geocoder')
const Product = require('../models/Product')
const asyncHandler = require('../middleware/async')
// const dotenv = require('dotenv')
// dotenv.config({ path: '../config/config.env' })
const readXlsxFile = require('read-excel-file/node')
const excel = require('exceljs')

// Import paytm checksum utility
const PaytmChecksum = require('../config/cheksum')

// @dec         Get all Products
//@route        GET /api/v1/products
//@access       Public
//author        kaushal
exports.getProducts = asyncHandler(async (req, res, next) => {
  if (req.params.shopId) {
    const products = await Product.find({ shop: req.params.shopId })

    return res
      .status(200)
      .json({ success: true, counts: products.length, data: products })
  } else {
    res.status(200).json(res.advanceResult)
  }
})

// @dec         Get product within a radius
//@route        DELETE /api/v1/shops/:zipcode/:distance
//@access       Public
//author        kaushal
exports.getProductInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  // get lat/lug from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // calc radius using radius
  // Divide dist by radius of Earth
  // Earth Radius = 6,378 km

  const radius = distance / 6378 // in km

  const shops = await Shop.find(
    {
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    },
    { id: 1 }
  )

  const products = await Product.find({
    shop: shops, //take id of shops in json formate
  })

  res
    .status(200)
    .json({ success: true, count: products.length, data: products })
})

// @dec         Create Products
//@route        POST /api/v1/products
//@access       Private
//author        kaushal
exports.createProducts = asyncHandler(async (req, res, next) => {
  req.body.shop = req.params.shopId
  req.body.user = req.user.id

  const shop = await Shop.findById(req.params.shopId)

  if (!shop) {
    return next(
      new ErrorResponce(
        `No Shop found to add products on this ${req.params.shopId} id`
      )
    )
  }

  // Make Sure user is product owner
  if (shop.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to add Products`,
        404
      )
    )
  }

  const product = await Product.create(req.body)

  res.status(201).json({ success: true, data: product })
})

// @dec         Get single Products
//@route        Get /api/v1/products/:id
//@access       Private
//author        kaushal
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(
      new ErrorResponce(`Product not found with this id ${req.params.id}`, 404)
    )
  }

  res.status(200).json({ success: true, data: product })
})

// @dec         Update Products
//@route        PUT /api/v1/products/:id
//@access       Private
//author        kaushal
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(
      new ErrorResponce(`Product not found with this id ${req.params.id}`)
    )
  }

  // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Update Products`,
        404
      )
    )
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, data: product })
})

// @dec         Delete Products
//@route        Delete /api/v1/products/:id
//@access       Private
//author        kaushal
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(
      new ErrorResponce(`Product not found with this id ${req.params.id}`)
    )
  }

  // Make Sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `User ${req.user.id} is not the owner of this Shop to Delete Products`,
        404
      )
    )
  }

  product = await Product.findByIdAndRemove(req.params.id)

  res.status(200).json({ success: true, msg: 'Product Delete Successfully!' })
})

// @dec         Upload photo for bootcamp
//@route        DELETE /api/v1/products/:id/photo
//@access       Privaet
//author        kaushal
exports.uploadProductPhoto = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    const error = new Error('please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  if (req.files) {
    console.log(req.files)

    console.log('files uploaded')
  }

  res.json(req.files)
})

// @dec         Like Product
//@route        create /api/v1/product/like/:productId
//@access       Private
//@author       kaushal
exports.likeProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId)

  // check product has already liked
  if (
    product.likes.filter((like) => like.user.toString() === req.user.id)
      .length > 0
  ) {
    return res.status(400).json({ msg: 'Product already  liked' })
  }

  product.likes.unshift({ user: req.user.id })

  await product.save()

  let likeNotification = `The user id ${req.user.id} is likes this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `

  await Shop.findByIdAndUpdate(req.params.shopId, {
    $push: {
      Notification: {
        $each: [
          {
            message: likeNotification,
            userId: req.user.id,
            shopId: req.params.shopId,
            productId: req.params.productId,
          },
        ],
      },
    },
  })

  res.status(201).json({ success: true, message: `you like this product ` })
})

// @dec         Unlike Product
//@route        create /api/v1/product/unlike/:productId
//@access       Private
//@author       kaushal
exports.unlikeProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId)

  // check product has already liked
  if (
    product.likes.filter((like) => like.user.toString() === req.user.id)
      .length === 0
  ) {
    return res.status(400).json({ msg: 'Product has not yet been liked' })
  }

  // get Remove index
  const removeIndex = product.likes
    .map((like) => like.user.toString())
    .indexOf(req.user.id)

  product.likes.splice(removeIndex, 1)

  await product.save()

  let unlikeNotification = `The user id ${req.user.id} is unlikes this product Id is ${req.params.productId} form ur shop id ${req.params.shopId} `

  await Shop.findByIdAndUpdate(req.params.shopId, {
    $push: {
      Notification: {
        $each: [
          {
            message: unlikeNotification,
            userId: req.user.id,
            shopId: req.params.shopId,
            productId: req.params.productId,
          },
        ],
      },
    },
  })

  res.status(201).json({ success: true, message: `you unlike this product` })
})

// @dec         Download csv file
//@route        create /api/v1/products/downloadCsvtemplate
//@access       Private
//author        kaushal
exports.downloadCSVFileForAllProduct = asyncHandler(async (req, res, next) => {
  Product.find().then((objs) => {
    let catalogs = []

    objs.forEach((obj) => {
      catalogs.push({
        id: obj._id,
        title: obj.title,
        description: obj.description,
      })
    })

    let workbook = new excel.Workbook()
    let worksheet = workbook.addWorksheet('catalogs')

    worksheet.columns = [
      { header: 'Id', key: 'id', width: 5 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Description', key: 'description', width: 25 },
    ]

    // Add Array Rows
    worksheet.addRows(catalogs)

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'catalogs.xlsx'
    )

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end()
    })
  })
})
