import express from "express";
import postOnField from "../controllers/post_onfield.js";
import putCheckout from "../controllers/put_checkout.js";
import putUpdateDone from "../controllers/put_update_done.js";

import getCaddyStandbySorted from "../controllers/get_caddy_standby_sorted.js";

const router = express.Router();

router.post("/rekap/onfield", postOnField);
router.put("/rekap/checkout/:id", putCheckout);
router.put("/rekap/update/:id", putUpdateDone);

router.get("/rekap/standby_caddy_sorted", getCaddyStandbySorted);

export default router;
