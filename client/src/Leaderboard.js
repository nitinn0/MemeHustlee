import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const api = process.env.REACT_APP_API_URL;
const socket = io(api);

const medals = [
  '🥇', // 1st
  '🥈', // 2nd
  '🥉', // 3rd
];

const Leaderboard = () => {
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${api}/leaderboard`);
            setMemes(response.data);
        } catch (err) {
            setError('Failed to fetch leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        socket.on('voteUpdated', fetchLeaderboard);
        return () => {
            socket.off('voteUpdated', fetchLeaderboard);
        };
    }, []);

    if (loading) return <div className="text-center text-lg text-gray-300 py-8">Loading leaderboard...</div>;
    if (error) return <div className="text-center text-red-400 py-8">{error}</div>;

    return (
        <section className="backdrop-blur-md bg-white/10 border border-pink-400/30 shadow-2xl rounded-2xl p-8 max-w-3xl mx-auto mb-8 mt-8">
            <h3 className="text-3xl font-extrabold text-yellow-300 mb-8 text-center tracking-tight drop-shadow">🏆 Leaderboard</h3>
            <ol className="space-y-6">
                {memes.map((meme, idx) => (
                    <li key={meme._id} className={`flex items-center gap-6 p-5 rounded-xl bg-[#181818]/80 border border-gray-800 shadow-lg ${idx < 3 ? 'ring-2 ring-yellow-400/60' : ''}`}>
                        <span className={`text-3xl w-10 text-center ${idx < 3 ? 'drop-shadow' : 'text-gray-400'}`}>{medals[idx] || idx + 1}</span>
                        <img src={meme.imageUrl} alt={meme.title} className="w-16 h-16 object-cover rounded-lg border-2 border-pink-400/40 shadow" />
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-bold text-lg truncate">{meme.title}</div>
                            <div className="text-pink-300 text-sm break-words line-clamp-2 max-w-xs">{meme.caption}</div>
                            <div className="text-blue-200 italic text-xs break-words line-clamp-1 max-w-xs">{meme.vibe}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-yellow-300 font-extrabold text-2xl drop-shadow">{meme.upvotes} <span className="text-base">▲</span></span>
                            <span className="text-xs text-gray-400 mt-1">Upvotes</span>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
};

export default Leaderboard; 