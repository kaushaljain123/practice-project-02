const ErrorResponce = require("../utils/errorResponce");
const User = require("../models/User");
const Cart = require("../models/Cart");

const asyncHandler = require("../middleware/async");

// @dec         Get all users
//@route        GET /api/v1/auth/users
//@access       private/ ADmin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResult);
});

// @dec         Get single user
//@route        GET /api/v1/auth/users/:id
//@access       private/ ADmin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({ success: true, data: user });
});

// @dec         Create users
//@route        POST /api/v1/auth/createusers
//@access       private/ ADmin
exports.createUsers = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @dec         Update users
//@route        PUT /api/v1/auth/users/:id
//@access       private/ ADmin
exports.updateUsers = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

   
// @dec         Showing cart product with same shop
//@route        create /api/v1/users/cart
//@access       Privaet
//shubham
exports.showCarttoUser = asyncHandler (async (req, res, next) => {
   req.user.id;
 
const cart = await Cart.find({user :req.user.id });
 // Make Sure product is find
 if (!cart) {
   return next(
     new ErrorResponce(
       `You have not product Anyy product to cart`
     )
   );
 }

return res.status(200).json({ success : true, count : cart.length, data : cart })

})


// @dec         Delete users
//@route        Delete /api/v1/auth/users/:id
//@access       private/ ADmin
exports.deleteUsers = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
