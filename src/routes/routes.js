import express from "express";
import getCaddyOnField from "../controllers/get_caddy_onfield.js";
import getDetailOnField from "../controllers/get_detail_onfield.js";
//import getCaddyDone from "../controllers/get_caddy_done.js";

const router = express.Router();

router.get("/rekap/caddy_onfield", getCaddyOnField);
//router.get("/rekap/caddy_done", getCaddyDone);
router.get("/rekap/detail_onfield/:id_caddy", getDetailOnField)

export default router;