import express from "express";
import postOnField from "../controllers/post_onfield.js";
import putCheckout from "../controllers/put_checkout.js";
import putUpdateDone from "../controllers/put_update_done.js";

const router = express.Router();

router.post("/rekap/onfield", postOnField);
router.put("/rekap/checkout/:id", putCheckout);
router.put("/rekap/update/:id", putUpdateDone);

export default router;
