import express from "express";
import postBooking from "../controllers/post_booking.js";
import getCaddyBooking from "../controllers/get_caddy_booking.js";
import postLibur from "../controllers/post_libur.js";

const router = express.Router();

router.post("/booking/create", postBooking);
router.get("/booking/get-caddy/:date", getCaddyBooking);

router.post("/libur/create", postLibur);

export default router;
