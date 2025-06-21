const mongoose = require("mongoose");

const memeSchema = new mongoose.Schema({
    title: {type: String, required: true},
    imageUrl:{type: String, required: true},
    tags:{type: [String], default: []},
    upvotes:{type: Number, default: 0}, 
    ownerId: {type: String, required: true},
    vibe: {type: String},
    caption: {type: String},
    // Auction fields
    startTime: { type: Date },
    endTime: { type: Date },
    highestBid: { type: Number, default: 0 },
    highestBidder: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    winner: { type: String, default: null }
})

module.exports = mongoose.model('Meme', memeSchema);