const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme', required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', bidSchema); 