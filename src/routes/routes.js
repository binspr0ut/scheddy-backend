import express from "express";
import postBooking from "../controllers/post_booking.js";
import postLibur from "../controllers/post_libur.js";
import getCalendar from "../controllers/get_calendar.js";
import getCalendarDetail from "../controllers/get_calendar_detail.js";
import getCaddyAvailable from "../controllers/get_caddy_available.js";

import postOnField from "../controllers/post_onfield.js";
import putCheckout from "../controllers/put_checkout.js";
import putUpdateDone from "../controllers/put_update_done.js";

import getCaddyStandbySorted from "../controllers/get_caddy_standby_sorted.js";
import getCaddyBooking from "../controllers/get_caddy_booking.js";

import getCaddyOnField from "../controllers/get_caddy_onfield.js";
import getDetailOnField from "../controllers/get_detail_onfield.js";
import getCaddyDone from "../controllers/get_caddy_done.js";
import postSchedule from "../controllers/post_schedule.js";

const router = express.Router();

router.post("/booking/create", postBooking);
router.get("/booking/get-caddy/:date", getCaddyAvailable);

router.post("/libur/create", postLibur);

router.get("/calendar", getCalendar);
router.get("/calendar/detail/:date", getCalendarDetail);

router.get("/rekap/standby_caddy_sorted", getCaddyStandbySorted);
router.get("/rekap/get_caddy_booking", getCaddyBooking);
router.post("/rekap/onfield", postOnField);
router.put("/rekap/checkout/:id", putCheckout);
router.put("/rekap/update/:id", putUpdateDone);
router.get("/rekap/caddy_onfield", getCaddyOnField);
router.get("/rekap/caddy_done", getCaddyDone);
router.get("/rekap/detail_onfield/:id_caddy", getDetailOnField);

router.post("/schedule/create", postSchedule);

export default router;
