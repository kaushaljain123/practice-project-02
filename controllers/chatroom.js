const ErrorResponce = require('../utils/errorResponce');
 const Chatroom = require("../models/Chatroom");
const User = require("../models/User");
const Message = require("../models/message");
const asyncHandler = require('../middleware/async');




// @dec         Create Chatrooms
//@route        POST /api/v1/product/:id
//@access       Private
//shubham
exports.createChatroom = asyncHandler (async (req, res, next) => {
    req.body.product = req.params.id;
    req.body.shop = req.params.shopId;
    //req.body.user = req.user.id;
  
    // const chatroomExist = await Chatroom.findById(req.params.id);
  
    // if (chatroomExist) {
    //   return next(
    //     new ErrorResponce(
    //       `No chatroom found `
    //     )
    //   );
    // }
    const chatroom = await Chatroom.create(req.body);
  
    res.status(201).json({ success: true, data: chatroom });
  })
  
  
  // @dec         Create message
  //@route        POST /api/v1/product/:id/:shopId/chatroom/:chatId
  //@access       Private
  //shubham
  exports.productChatroom = asyncHandler (async (req, res, next) => {
    req.body.product = req.params.id;
    req.body.shop = req.params.shopId;
    req.body.chatroom = req.params.chatId;
  
  
    //req.body.user = req.user.id;
  
    const chatroomExist = await Chatroom.findById(req.params.id);
  
    if (chatroomExist) {
      return next(
        new ErrorResponce(
          `No chatroom found `
        )
      );
    }
    const message = await Message.create(req.body);
  
    res.status(201).json({ success: true, data: message });
  })
  // @dec         Show message
  //@route        Get /api/v1/product/:id/:shopId/chatroom/:chatId
  //@access       Private
  //shubham 
  exports.chatroomMessage = asyncHandler (async (req, res, next) => {
    req.body.product = req.params.id;
    req.body.shop = req.params.shopId;
    req.body.chatroom = req.params.chatId;
    //req.body.user = req.user.id;
  
    if(req.params.shopId) {
      const message = await Message.find({
        product :req.params.id,
        shop : req.params.shopId,
        chatroom : req.params.chatId,
      },{message:1});
      return res.status(200).json({ success : true, count : message.length, data : message })
  } else {
   res.status(200).json(res.advanceResult);
  }
  })