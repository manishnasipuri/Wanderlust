const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLust";

async function checkListings() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings`);
    listings.forEach((listing, i) => {
        console.log(`${i+1}. ${listing.title} - Image:`, listing.image);
    });

    await mongoose.disconnect();
}

checkListings().catch(console.error);