const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.postReview =  async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        res.redirect(`/listings/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};


module.exports.deleteReview = async (req, res) => {
    try {
        let { id, reviewId } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};