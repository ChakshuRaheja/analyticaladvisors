const express = require("express");
const router = express.Router();
const esignController = require("../controllers/esign.controller");

// eSign routes
router.post("/init", esignController.initEsign);
router.get("/verify", esignController.verifyEsign);

module.exports = router;
