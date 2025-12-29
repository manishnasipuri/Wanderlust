const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIN , validateReview, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");





//Reviews
//Post Route for reviews
router.post("/", isLoggedIN, validateReview, wrapAsync(reviewController.postReview));

//Delete Route for reviews
router.delete("/:reviewId", isLoggedIN,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
