const Meme = require('../models/Meme');

// Start an auction for a meme
exports.startAuction = async (req, res) => {
    const memeId = req.params.memeId;
    const { durationMinutes } = req.body; // e.g., 60 for 1 hour
    try {
        const meme = await Meme.findById(memeId);
        if (!meme) return res.status(404).json({ error: 'Meme not found.' });
        if (meme.isActive) return res.status(400).json({ error: 'Auction already active.' });
        const now = new Date();
        meme.startTime = now;
        meme.endTime = new Date(now.getTime() + (durationMinutes || 60) * 60000);
        meme.isActive = true;
        meme.highestBid = 0;
        meme.highestBidder = null;
        meme.winner = null;
        await meme.save();
        res.json({ success: true, meme });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// End an auction for a meme
exports.endAuction = async (req, res) => {
    const memeId = req.params.memeId;
    try {
        const meme = await Meme.findById(memeId);
        if (!meme) return res.status(404).json({ error: 'Meme not found.' });
        if (!meme.isActive) return res.status(400).json({ error: 'Auction is not active.' });
        meme.isActive = false;
        meme.winner = meme.highestBidder;
        await meme.save();
        res.json({ success: true, winner: meme.winner, highestBid: meme.highestBid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get auction status for a meme
exports.getAuctionStatus = async (req, res) => {
    const memeId = req.params.memeId;
    try {
        const meme = await Meme.findById(memeId);
        if (!meme) return res.status(404).json({ error: 'Meme not found.' });
        res.json({
            isActive: meme.isActive,
            startTime: meme.startTime,
            endTime: meme.endTime,
            highestBid: meme.highestBid,
            highestBidder: meme.highestBidder,
            winner: meme.winner
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 