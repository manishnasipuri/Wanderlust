const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");




module.exports.index =  async (req , res ) => {
  const allListings = await Listing.find({});
  res.render("listings/index" , {allListings});
};

module.exports.renderNewForm = (req , res ) => {
    res.render("listings/new.ejs");
};


module.exports.showListing =   async (req , res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs" , { listing });
};


module.exports.createListing = async(req , res, next ) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let listingData = { ...req.body.listing };
    if (listingData.image) {
        listingData.image = {
            url: listingData.image,
            filename: "listingimage"
        };
    }
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = { url , filename };
   await newListing.save();
   req.flash("success" , "New Listing Created !");
   res.redirect("/listings");
   
};


module.exports.editListing = async(req, res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

let originalImageUrl = listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");


    res.render("listings/edit.ejs" , {listing , originalImageUrl});
};


module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    // 1️⃣ Find listing
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // 2️⃣ Update text fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // 3️⃣ If new image uploaded → replace old image
    if (req.file) {
        // delete old image from cloudinary
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        // save new image
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // 4️⃣ Save changes
    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};