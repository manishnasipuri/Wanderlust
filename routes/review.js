const express = require('express');
const router = express.Router({margeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const logger = (req,res,next)=>{
    console.log(req.url)
    next();
};

//review validation middleware
const validateReview = (req, res, next) => {
    console.log(req.body);
   let {error} =  reviewSchema.validate(req.body);
   if(error){
    console.log(error.message);
    let errMsg = error.details.map((el) => el.message).join(",");
    // ExpressError constructor expects (message, statusCode)
    throw new ExpressError(errMsg, 400);
   } else{
    next();
   }
};




//Reviews
//Post Route for reviews
router.post("/",logger ,validateReview, async(req , res) => {
    let listing = await Listing.findById(req.params.id );
    console.log(listing)
    console.log(req.body.review);
    let newReview = new Review(req.body.review);
    console.log(req.params.id);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    res.redirect(`/listings/${req.params.id}`);
});

//Delete Route for reviews
router.delete("/:reviewId" , async(req , res) => {
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
});

module.exports = router;
