import express from "express";
import postBooking from "../controllers/post_booking.js";
import getCaddyBooking from "../controllers/get_caddy_booking.js";

const router = express.Router();

router.post("/booking/create", postBooking);
router.get("/booking/get-caddy/:date", getCaddyBooking);

export default router;
