import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Leaderboard = () => {
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:5000/leaderboard');
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

    if (loading) return <div>Loading leaderboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Top Memes</h3>
            <ol style={{ padding: 0, listStyle: 'none' }}>
                {memes.map((meme, idx) => (
                    <li key={meme._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, background: '#222', borderRadius: 8, padding: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 20, color: '#ffd700', marginRight: 16 }}>{idx + 1}.</span>
                        <img src={meme.imageUrl} alt={meme.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, marginRight: 16 }} />
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-bold text-lg truncate">{meme.title}</div>
                            <div className="text-pink-300 text-sm break-words line-clamp-2 max-w-xs">{meme.caption}</div>
                            <div className="text-blue-200 italic text-xs break-words line-clamp-1 max-w-xs">{meme.vibe}</div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Leaderboard; 