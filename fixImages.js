const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLust";

async function fixImages() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({});
    for (let listing of listings) {
        console.log(`Checking ${listing.title}: typeof image = ${typeof listing.image}`);
        if (typeof listing.image === 'string') {
            console.log(`Fixing ${listing.title}`);
            listing.image = {
                filename: "listingimage",
                url: listing.image
            };
            await listing.save();
            console.log(`Fixed listing: ${listing.title}`);
        }
    }

    console.log("All images fixed");
    await mongoose.disconnect();
}

fixImages().catch(console.error);