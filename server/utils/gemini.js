const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-1.5-flash'; // Use the latest available model

// Helper to log detailed error
function logGeminiError(error, context) {
    if (error.response) {
        console.error(`Gemini API error (${context}):`, error.response.status, error.response.data);
    } else {
        console.error(`Gemini API error (${context}):`, error.message);
    }
}

async function generateCaption(tags) {
    try {
        const response = await axios.post(
            `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Funny caption for meme with tags: ${tags.join(', ')}. Keep it short (1-3 lines).`
                            }
                        ]
                    }
                ]
            }
        );
        // Gemini API returns text in response.data.candidates[0].content.parts[0].text
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No caption generated.';
    } catch (error) {
        logGeminiError(error, 'generateCaption');
        return 'Error generating caption.';
    }
}

async function analyzeVibe(tags) {
    try {
        const response = await axios.post(
            `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Describe vibe of meme with tags: ${tags.join(', ')}. Keep it short (1-2 sentences).`
                            }
                        ]
                    }
                ]
            }
        );
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No vibe detected.';
    } catch (error) {
        logGeminiError(error, 'analyzeVibe');
        return 'Error analyzing vibe.';
    }
}

module.exports = { generateCaption, analyzeVibe };
