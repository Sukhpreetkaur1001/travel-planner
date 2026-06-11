const express = require("express");
const router = express.Router();

const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  sendActivityMail,
} = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");
const { ensureSubscriptionActive } = require("../middleware/subscriptionMiddleware");

// Routes
router.use(protect);

router.get("/", getTrips);
router.get("/:id", getTrip);
router.post("/", ensureSubscriptionActive, createTrip);
router.put("/:id", ensureSubscriptionActive, updateTrip);
router.delete("/:id", ensureSubscriptionActive, deleteTrip);
router.post(
  "/:id/send-activity-mail",
  ensureSubscriptionActive,
  sendActivityMail
);

module.exports = router;
