const express = require("express");
const { getSales, 
        getSale
      } = require("../controllers/sale");
const router = express.Router({ mergeParams: true });

 

router.route("/").get(getSales);
router.route("/:id").get(getSale);
    
module.exports = router;