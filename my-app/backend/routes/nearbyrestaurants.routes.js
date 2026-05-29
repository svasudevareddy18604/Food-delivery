const express = require("express");
const router = express.Router();

const User = require("../models/User");

/* =====================================
   GET NEARBY RESTAURANTS
===================================== */

router.get("/", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const restaurants = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lon, lat],
          },

          distanceField: "distance",

          maxDistance: 50000, // 50 KM

          spherical: true,
        },
      },

      {
        $match: {
          role: "merchant",
          isApproved: true,
          registrationCompleted: true,
        },
      },

      {
        $project: {
          _id: 1,
          restaurantName: 1,
          restaurantType: 1,
          restaurantAddress: 1,
          restaurantImage: 1,
          openingTime: 1,
          closingTime: 1,
          isOnline: 1,

          distance: {
            $round: [
              {
                $divide: ["$distance", 1000],
              },
              2,
            ],
          },
        },
      },

      {
        $sort: {
          distance: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      totalRestaurants: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Nearby Restaurants Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;