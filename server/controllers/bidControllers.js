const Bid = require('../models/Bid');
const Meme = require('../models/Meme');

exports.placeBid = async (req, res) => {
    const memeId = req.params.memeId;
    const { amount } = req.body;
    const userId = 'cyberpunk420';
    if (!memeId || !userId || !amount) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        // Fetch the meme to check auction status and highest bid
        const meme = await Meme.findById(memeId);
        if (!meme) return res.status(404).json({ error: 'Meme not found.' });
        if (amount <= meme.highestBid) return res.status(400).json({ error: 'Bid must be higher than current highest bid.' });

        // Save the bid
        const bid = new Bid({ memeId, userId, amount });
        await bid.save();

        // Update meme's highest bid and bidder
        meme.highestBid = amount;
        meme.highestBidder = userId;
        await meme.save();

        req.io.emit('bidPlaced', { memeId, userId, amount, bidId: bid._id });
        res.status(201).json(bid); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
