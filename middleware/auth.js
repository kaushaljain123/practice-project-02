const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponce');
const User = require('../models/User');

 
// Protected Routes

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // else if(req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make Sure token exists

    if(!token) {
        return next(new ErrorResponse('Not authorize to access this route', 401));
    }

    try {
        // Verify token
        const decoder = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoder);

        req.user = await User.findById(decoder.id)

        next()
    } catch(err) {
        return next(new ErrorResponse('Not authorize to access this route', 401));
    }
})

//  Grand access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log(req.user)
        if(!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorize to access this route`, 403));
        }
        next()
    }
}