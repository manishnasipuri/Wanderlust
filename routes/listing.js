const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIN, isowner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX + CREATE
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIN,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// NEW
router.get("/new", isLoggedIN, listingController.renderNewForm);

// SHOW
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT
router.get("/:id/edit",
  isLoggedIN,
  isowner,
  wrapAsync(listingController.editListing)
);

// UPDATE
router.put("/:id",
  isLoggedIN,
  isowner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// DELETE ✅ (IMPORTANT)
router.delete("/:id",
  isLoggedIN,
  isowner,
  wrapAsync(listingController.deleteListing)
);

module.exports = router;
