const express = require("express");
const { protect } = require("../middlewares/auth");
const { premium } = require("../middlewares/premium");
const { leaderboard, download } = require("../controllers/premium");

const router = express.Router();

router.get("/leaderboard", protect, premium, leaderboard);
router.get("/download", protect, premium, download);

module.exports = router;
