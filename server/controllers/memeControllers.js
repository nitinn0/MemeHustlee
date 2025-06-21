const Meme = require("../models/Meme");
const { io } = require("../server");
const { generateCaption, analyzeVibe } = require("../utils/gemini");

exports.createMeme = async (req, res) => {
    const { title, imageUrl, tags } = req.body;
    const ownerId = 'cyberpunk420';
    if(!title || !imageUrl ||!tags){
        return res.status(400).json({ error: "All fields are req."});
    }
    try{
        // Generate caption and vibe using Gemini
        const tagsArr = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
        if (!tagsArr || !Array.isArray(tagsArr) || tagsArr.length === 0) {
            return res.status(400).json({ error: "Tags are required." });
        }
        const [caption, vibe] = await Promise.all([
            generateCaption(tagsArr),
            analyzeVibe(tagsArr)
        ]);
        const meme = new Meme({ title, imageUrl, tags: tagsArr, ownerId, caption, vibe });
        await meme.save();
        res.status(201).json(meme);
    } catch(error){
        res.status(500).json({error: error.message});
    }
}

exports.getMeme = async (req, res) => {
    try{
        const meme = await Meme.findById(req.params.id);
        if(!meme) return res.status(404).json({ error:"Meme not found"});
        res.json(meme);
    } catch(error){
        res.status(400).json({ error: error.message});
    }
};

exports.getAllMemes = async (req, res) => {
    try{
        const memes  = await Meme.find();
        res.json(memes);
    } catch(error){
        req.status(500).json({error: error.message});
    }
};

exports.voteMeme = async (req, res) => {
    try{
        const meme = await Meme.findById(req.params.id);
        if (!meme) return res.status(404).json({ error: "Meme not found" });

        // 3. Increment the meme's upvotes property by 1 (initialize to 0 if undefined).
        meme.upvotes = (meme.upvotes || 0) + 1;

        await meme.save();

        req.io.emit('voteUpdated', { memeId: meme._id, upvotes: meme.upvotes });
        res.json({ success: true, upvotes: meme.upvotes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downvoteMeme = async (req, res) => {
    try {
        const meme = await Meme.findById(req.params.id);
        if (!meme) return res.status(404).json({ error: "Meme not found" });
        meme.upvotes = Math.max((meme.upvotes || 0) - 1, 0);
        await meme.save();
        req.io.emit('voteUpdated', { memeId: meme._id, upvotes: meme.upvotes });
        res.json({ success: true, upvotes: meme.upvotes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        // Parse the 'top' query parameter from the request, defaulting to 10 if not provided or invalid.
        const top = parseInt(req.query.top) || 10;

        // Query the Meme collection, sorting all memes in descending order by their 'upvotes' field,
        // and limiting the result to the top N memes as specified by 'top'.
        const memes = await Meme.find()
        .sort({ upvotes: -1 })
        .limit(top);
        
        res.json(memes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMeme = async (req, res) => {
    try {
        const meme = await Meme.findByIdAndDelete(req.params.id);
        if (!meme) return res.status(404).json({ error: "Meme not found" });
        req.io.emit('memeDeleted', { memeId: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};