const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIN , isowner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({  storage });



//Index Route & Create Route
router.route("/")
     .get(  wrapAsync(listingController.index))
     .post(
     isLoggedIN,
     upload.single('listing[image]'),
     validateListing,
     wrapAsync(listingController.createListing));
    


//New Route
router.get("/new" , isLoggedIN, listingController.renderNewForm);



// Show & Update Route
     router.route("/:id")
          .get(wrapAsync(listingController.showListing))
          .post(isLoggedIN,isowner,
           wrapAsync(listingController.updateListing));
          















// Edit The Route
router.get("/:id/edit" , isLoggedIN,isowner, wrapAsync(listingController.editListing));






module.exports = router;
