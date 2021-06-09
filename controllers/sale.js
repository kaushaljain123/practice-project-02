const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const User =require('../models/User')

// @dec         Get all salespersons
//@route        GET /api/v1/sales
//@access       Public
exports.getSales = asyncHandler (async (req, res, next) => {
    if(req.params.id) {
        const sale = await User.find({ _id : req.prams.id, role: 'sales' });
    
        return res.status(200).json({ success : true, data : sale })
    } else {
        const sales = await User.find({ role: 'sales' });
    
        return res.status(200).json({ success : true, count : sales.length, data : sales })
        }
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
 


  