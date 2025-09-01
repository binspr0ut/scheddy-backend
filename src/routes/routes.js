import express from "express";

import postOnField from "../controllers/post_onfield.js";
import putCheckout from "../controllers/put_checkout.js";
import putUpdateDone from "../controllers/put_update_done.js";

import getCaddyStandbySorted from "../controllers/get_caddy_standby_sorted.js";

import getCaddyOnField from "../controllers/get_caddy_onfield.js";
import getDetailOnField from "../controllers/get_detail_onfield.js";
import getCaddyDone from "../controllers/get_caddy_done.js";

const router = express.Router();

router.post("/rekap/onfield", postOnField);
router.put("/rekap/checkout/:id", putCheckout);
router.put("/rekap/update/:id", putUpdateDone);

router.get("/rekap/standby_caddy_sorted", getCaddyStandbySorted);

router.get("/rekap/caddy_onfield", getCaddyOnField);
router.get("/rekap/caddy_done", getCaddyDone);
router.get("/rekap/detail_onfield/:id_caddy", getDetailOnField)

export default router;