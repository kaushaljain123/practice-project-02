const path = require('path');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const User =require('../models/User')
const geocoder = require('../utils/geocoder');



// @dec         Get all salespersons
//@route        GET /api/v1/sales
//@access       Public
exports.getSales = asyncHandler (async (req, res, next) => {
    const sale = await User.find({ role: 'sales' });
    
    return res.status(200).json({ success : true, data : sale })
})

  
// @dec         Get single salesperons
//@route        Get /api/v1/sales/:id
//@access       Private
exports.getSale = asyncHandler (async (req, res, next) => {
    const sale = await User.findById(req.prams.id,{ role: 'sales' }) ;

    if(!sale) {
        return next(new ErrorResponce(`saleperson not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({ success : true, data : sale })
})
 


// @dec         Get sales person within a radius
//@route        Get /api/v1/sales/:zipcode/:distance
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
        location : { $geoWithin : { $centerSphere: [ [ lng, lat ], radius ] } },role:'sales'
    })

    res.status(200).json({ success : true, count : sales.length, data : sales })
})




// @dec         Create sales
//@route        POST /api/v1/auth/createsales
//@access       private/ ADmin
exports.createSales = asyncHandler(async (req, res, next) => {
 
    req.body.sales = 'sales'

    const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @dec         Update sales
//@route        PUT /api/v1/auth/sales/:id
//@access       private/ ADmin
exports.updateSales = asyncHandler(async (req, res, next) => {
  const sale = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: sale });
});

// @dec         Delete sales
//@route        Delete /api/v1/auth/sales/:id
//@access       private/ ADmin
exports.deleteSales = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

  