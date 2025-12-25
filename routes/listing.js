const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");







const validateListing = (req, res, next) => {
   let {error} =  listingSchema.validate(req.body);
   if(error){
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(errMsg , 400);
   } else{
    next();
   }
};


//Index Route
router.get("/" , async (req , res ) => {
  const allListings = await Listing.find({});
  res.render("listings/index" , {allListings});
});

router.get("/new" , (req , res ) => {
    res.render("listings/new.ejs");
});


//show route
router.get("/:id",wrapAsync(  async (req , res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("listings/show.ejs" , { listing });
}));


//Create Route
router.post(
    "/" ,
     validateListing,
     wrapAsync(async(req , res, next ) => {
    let listingData = { ...req.body.listing };
    if (listingData.image) {
        listingData.image = {
            url: listingData.image,
            filename: "listingimage"
        };
    }
    const newListing = new Listing(listingData);
   await newListing.save();
   req.flash("success" , "New Listing Created !");
   res.redirect("/listings");
   
}));


// Edit The Route
router.get("/:id/edit" , async(req, res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
});


//update Route
router.put("/:id",
    validateListing,
     async (req, res) => {
    let { id } = req.params;
    let updateData = { ...req.body.listing };
    if (updateData.image) {
        updateData.image = {
            url: updateData.image,
            filename: "listingimage"
        };
    }
    await Listing.findByIdAndUpdate(id, updateData);
    res.redirect("/listings");
});



//Delete Route
router.delete("/:id" , async(req, res ) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});



module.exports = router;
