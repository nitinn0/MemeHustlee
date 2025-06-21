const express = require("express");
const router = express.Router();
const memeController = require("../controllers/memeControllers");
const gemini = require('../utils/gemini');

router.post('/meme', memeController.createMeme);

router.get('/memes', memeController.getAllMemes);

router.get('/memes/:id', memeController.getMeme);

router.post('/memes/:id/vote', memeController.voteMeme);

router.post('/memes/:id/downvote', memeController.downvoteMeme);

router.get('/leaderboard', memeController.getLeaderboard);

router.get('/test/gemini-caption', async (req, res) => {
    const tags = (req.query.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    if (!tags.length) return res.status(400).json({ error: 'No tags provided' });
    const caption = await gemini.generateCaption(tags);
    res.json({ caption });
});

router.get('/test/gemini-vibe', async (req, res) => {
    const tags = (req.query.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    if (!tags.length) return res.status(400).json({ error: 'No tags provided' });
    const vibe = await gemini.analyzeVibe(tags);
    res.json({ vibe });
});

router.delete('/memes/:id', memeController.deleteMeme);

module.exports = router;