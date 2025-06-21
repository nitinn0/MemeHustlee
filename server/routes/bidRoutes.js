const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidControllers");
const gemini = require("../utils/gemini");

router.post('/memes/:memeId/bid', bidController.placeBid);

module.exports = router;