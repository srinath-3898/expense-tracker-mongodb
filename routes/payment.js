const express = require("express");
const { protect } = require("../middlewares/auth");
const { createOrder, updateStatus } = require("../controllers/payment");

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/update-status", protect, updateStatus);

module.exports = router;
