const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");




const MONGO_URL= "mongodb://127.0.0.1:27017/WonderLust";
main().then(() => {
    console.log("connected to db")
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine" , "ejs" );
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));




app.get("/" , (req, res ) => {
    res.send("hi i am root");
})

const logger = (req,res,next)=>{
    console.log(req.url)
    next();
}
const validateListing = (req, res, next) => {
   let {error} =  listingSchema.validate(req.body);
   if(error){
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(errMsg , 400);
   } else{
    next();
   }
};


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



app.get("/listings" , async (req , res ) => {
  const allListings = await Listing.find({});
  res.render("listings/index" , {allListings});
});

app.get("/listings/new" , (req , res ) => {
    res.render("listings/new.ejs");
});


//show route
app.get("/listings/:id",wrapAsync(  async (req , res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("listings/show.ejs" , { listing });
}));


//Create Route
app.post(
    "/listings" ,
     validateListing,
     wrapAsync(async(req , res, next ) => {
    const newListing = new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
   
}));


// Edit The Route
app.get("/listings/:id/edit" , async(req, res ) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});
});


//update Route
app.put("/listings/:id",
     async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Handle image separately so it's always an object
    if (req.body.listing.image) {
        listing.image = {
            filename: "listingimage",
            url: req.body.listing.image
        };
        await listing.save();
    }

    res.redirect("/listings");
});



//Delete Route
app.delete("/listings/:id" , async(req, res ) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

//Reviews
//Post Route for reviews
app.post("/listings/:id/reviews",logger ,validateReview, async(req , res) => {
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
app.delete("/listings/:id/reviews/:reviewId" , async(req , res) => {
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
});






// app.get("/testListing" , async(req ,res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Victoria , Kolkata",
//         country : "India ",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved ");
//     res.send("Successful testing");
// });



//generic error handler
app.all("/*" , (req, res, next) => {
    next(new ExpressError("Page Not Found" , 404));
});

//generic error handler

app.use((err, req, res, next) => {
    let { statusCode,message } = err;
    res.render("error.ejs" , {message});
    // res.status(statusCode).send(massage);
});



app .listen(8080 ,() => {
    console.log("Server is listening to port 8080");
});

