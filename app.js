
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoutes = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLust";






const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 1000 * 60 * 60 * 24 *7,
        maxAge : 1000 * 60 * 60 * 24 *7,
        httpOnly : true,
    },
};


// // Root Route
// app.get("/" , (req, res ) => {
//     res.send("hi i am root");
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));




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


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});



app.use((req, res, next) => {
    res.locals.search = req.query.search || "";
    res.locals.category = req.query.category || "";
    next();
});


app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews" , reviewRoutes);
app.use("/", userRoutes);









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
    try {
        let { statusCode = 500, message = "Something went wrong!" } = err;
        res.status(statusCode).render("error.ejs", { message });
    } catch (renderErr) {
        console.error("Render error:", renderErr);
        res.status(500).send("Internal Server Error");
    }
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

main().then(() => {
    console.log("connected to db");
    app.listen(8080, () => {
        console.log("Server is listening to port 8080");
    });
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}


