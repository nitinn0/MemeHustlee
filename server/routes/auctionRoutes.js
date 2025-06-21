const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionControllers');

// Start an auction for a meme
router.post('/memes/:memeId/auction/start', auctionController.startAuction);
// End an auction for a meme
router.post('/memes/:memeId/auction/end', auctionController.endAuction);
// Get auction status for a meme
router.get('/memes/:memeId/auction/status', auctionController.getAuctionStatus);

module.exports = router; 