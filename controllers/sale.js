const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const User =require('../models/User')
const Shop =require('../models/Shop')
const geocoder = require('../utils/geocoder');
const Sales = require('../models/Sales');

// @dec         Get all salespersons
//@route        GET /api/v1/sales
//@access       Public
exports.getSales = asyncHandler (async (req, res, next) => {
    const sale = await User.find({ role: 'salesMember' });

    if(sale) {
      return res.status(200).json({ success : true, count:sale.length, data : sale })
    } else {
      return next(new ErrorResponce('No Member Found', 404))
    }

})

// @dec         Get single salesperons
//@route        Get /api/v1/sales/:id
//@access       Private
exports.getSale = asyncHandler (async (req, res, next) => {
    const sale = await User.find({_id: req.params.id, role: 'salesMember'}) ;
    if(!sale) {
        return next(new ErrorResponce(`saleperson not found with this id ${req.params.id}`, 404))
    }
    res.status(200).json({ success : true, data : sale })
})
 
// @dec         Get sales person within a radius
//@route        Get /api/v1/sales/radius/:zipcode/:distance
//@access       Private
exports.getSalesInRadius = asyncHandler( async (req, res, next) => {
    const { zipcode, distance } = req.params
    // get lat/lug from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude
    const lng = loc[0].longitude
    // calc radius using radius
    // Divide dist by radius of Earth
    // Earth Radius = 6,378 km
    const radius = distance / 6378 // in km
    const sales = await User.find({
        location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } },role:'salesMember'
    })
    res.status(200).json({ success : true, count : sales.length, data : sales })
})

// @dec          Create sales
// @route        POST /api/v1/createsales
// @access       private/ salesAdmin/Admin
exports.createSales = asyncHandler(async (req, res, next) => {
    req.body.role = 'salesMember';
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
});

// @dec          Update sales
// @route        PUT /api/v1/sales/:id
// @access       private/ ADmin
exports.updateSales = asyncHandler(async (req, res, next) => {
  const sale = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: sale });
});

// @dec         Delete sales
// @route        Delete /api/v1/sales/:id
// @access       private/ ADmin
exports.deleteSales = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @dec          Verify shop
// @route        verify shop /api/v1/sales/verifyshop/:shopID
// @access       private/ ADmin /Sales
exports.verifyShop = asyncHandler(async (req, res, next) => {
   const sale = await Sales.findOne({shop: req.params.shopId});
    if(sale) {
        return next(new ErrorResponce(`shop is already verify by salesperson`,500))
    }

    const verifypin = await Shop.findById(req.params.shopId)
    console.log(verifypin.verifyPin)
    console.log(req.body.pin)
    if(verifypin.verifyPin !== req.body.pin) {
       res.status(202).json({ success : false, type : 'pinWrong', message : 'Pin is Not Match' })
    } else {
      const verifyShop = await Shop.findByIdAndUpdate(req.params.shopId, {
        isVerified : true,
        sale : req.user.id,
      })
  
      const createsales = await Sales.create({
        shop:req.params.shopId,
        sales:req.user.id,
      });
  
      res.status(200).json({ success: true, message:`Shop ${req.params.shopId} is verified ${req.params.id}` , salesverify:createsales });
    }
});

// @dec         showing Shop Verify By Sale
// @route        create /api/v1/sales/:id
// @access       Privaet
// shubham
exports.showShopVerifyBySale = asyncHandler (async (req, res, next) => {
  const sale = req.user.id;
  const VerifyShop = await Shop.find({ sale:sale },{Notification:0,location:0});
  return res.status(200).json({ success : true, No:VerifyShop.length , data : VerifyShop })
}) 