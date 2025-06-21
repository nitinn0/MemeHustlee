import React, { useState, useEffect } from "react";
import axios from 'axios';
import { io } from 'socket.io-client';

const api = process.env.REACT_APP_API_URL;
const socket = io(api);

const MemeGallery = () => {
    const [memes, setMemes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [bidAmounts, setBidAmounts] = useState({}); // { memeId: amount }
    const [bidError, setBidError] = useState({}); // { memeId: errorMsg }

    // Fetch memes
    useEffect(() => {
        const fetchMemes = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${api}/memes`);
                setMemes(response.data);
            } catch (err) {
                setError('Failed to fetch memes.');
            } finally {
                setLoading(false);
            }
        };
        fetchMemes();
    }, []);

    // Real-time bid updates
    useEffect(() => {
        socket.on('bidPlaced', ({ memeId, userId, amount }) => {
            setMemes(prevMemes => prevMemes.map(meme =>
                meme._id === memeId
                    ? { ...meme, highestBid: amount, highestBidder: userId }
                    : meme
            ));
        });
        return () => {
            socket.off('bidPlaced');
        };
    }, []);

    // Real-time vote updates
    useEffect(() => {
        socket.on('voteUpdated', ({ memeId, upvotes }) => {
            setMemes(prevMemes => prevMemes.map(meme =>
                meme._id === memeId
                    ? { ...meme, upvotes }
                    : meme
            ));
        });
        return () => {
            socket.off('voteUpdated');
        };
    }, []);

    // Real-time meme deletion
    useEffect(() => {
        socket.on('memeDeleted', ({ memeId }) => {
            setMemes(prevMemes => prevMemes.filter(meme => meme._id !== memeId));
        });
        return () => {
            socket.off('memeDeleted');
        };
    }, []);

    // Handle bid input change
    const handleBidChange = (memeId, value) => {
        setBidAmounts({ ...bidAmounts, [memeId]: value });
    };

    // Handle bid submit
    const handleBidSubmit = async (memeId) => {
        setBidError({ ...bidError, [memeId]: '' });
        try {
            await axios.post(`${api}/memes/${memeId}/bid`, {
                amount: Number(bidAmounts[memeId])
            });
            setBidAmounts({ ...bidAmounts, [memeId]: '' });
        } catch (err) {
            setBidError({ ...bidError, [memeId]: err.response?.data?.error || 'Bid failed' });
        }
    };

    // Handle upvote
    const handleUpvote = async (memeId) => {
        try {
            await axios.post(`${api}/memes/${memeId}/vote`);
        } catch (err) {}
    };

    // Handle downvote
    const handleDownvote = async (memeId) => {
        try {
            await axios.post(`${api}/memes/${memeId}/downvote`);
        } catch (err) {}
    };

    // Handle meme delete
    const handleDelete = async (memeId) => {
        try {
            await axios.delete(`${api}/memes/${memeId}`);
        } catch (err) {
            alert('Failed to delete meme');
        }
    };

    if (loading) return <div className="text-center text-lg text-gray-300 py-8">Loading memes...</div>;
    if (error) return <div className="text-center text-red-400 py-8">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">Meme Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {memes.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400">No memes found.</div>
                ) : (
                    memes.map((meme) => (
                        <div key={meme._id} className="bg-[#232323] rounded-xl shadow-lg p-4 flex flex-col items-center transition-transform hover:scale-105 border border-gray-700">
                            <img src={meme.imageUrl} alt={meme.title} className="w-full h-48 object-cover rounded-lg mb-3 border border-gray-800" />
                            <h4 className="text-lg font-semibold text-white mb-1 truncate w-full text-center">{meme.title}</h4>
                            <div className="text-xs text-gray-400 mb-2 w-full text-center">Tags: {meme.tags && meme.tags.join(', ')}</div>
                            <p className="text-pink-400 text-center text-base font-medium mb-1">{meme.caption}</p>
                            <p className="text-blue-300 italic text-center text-sm mb-2">{meme.vibe}</p>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-yellow-300 font-bold">{meme.upvotes}</span>
                                <button onClick={() => handleUpvote(meme._id)} className="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 font-bold text-lg transition">▲</button>
                                <button onClick={() => handleDownvote(meme._id)} className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 font-bold text-lg transition">▼</button>
                                <button onClick={() => handleDelete(meme._id)} className="bg-gray-700 hover:bg-gray-900 text-white rounded px-2 py-1 font-bold text-lg transition">🗑️</button>
                            </div>
                            <div className="w-full text-center text-sm text-gray-300 mb-2">
                                <span className="font-semibold">Highest Bid:</span> <span className="text-green-400 font-bold">{meme.highestBid || 0} credits</span><br />
                                <span className="font-semibold">Highest Bidder:</span> <span className="text-purple-300">{meme.highestBidder || 'None'}</span>
                            </div>
                            <div className="w-full flex gap-2 mt-auto">
                                <input
                                    type="number"
                                    min={(meme.highestBid || 0) + 1}
                                    placeholder="Your bid (credits)"
                                    value={bidAmounts[meme._id] || ''}
                                    onChange={e => handleBidChange(meme._id, e.target.value)}
                                    className="flex-1 px-2 py-1 rounded border border-gray-600 bg-[#181818] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                                <button
                                    onClick={() => handleBidSubmit(meme._id)}
                                    className="bg-pink-500 hover:bg-pink-600 text-white rounded px-3 py-1 font-semibold transition"
                                >
                                    Place Bid
                                </button>
                            </div>
                            {bidError[meme._id] && <div className="text-red-400 text-xs mt-2">{bidError[meme._id]}</div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemeGallery;