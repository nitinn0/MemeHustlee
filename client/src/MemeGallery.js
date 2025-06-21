import React, { useState, useEffect } from "react";
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

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
                const response = await axios.get('http://localhost:5000/memes');
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
            await axios.post(`http://localhost:5000/memes/${memeId}/bid`, {
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
            await axios.post(`http://localhost:5000/memes/${memeId}/vote`);
        } catch (err) {
            // Optionally handle error
        }
    };

    // Handle downvote
    const handleDownvote = async (memeId) => {
        try {
            await axios.post(`http://localhost:5000/memes/${memeId}/downvote`);
        } catch (err) {
            // Optionally handle error
        }
    };

    // Handle meme delete
    const handleDelete = async (memeId) => {
        try {
            await axios.delete(`http://localhost:5000/memes/${memeId}`);
            // The meme will be removed via real-time update
        } catch (err) {
            alert('Failed to delete meme');
        }
    };

    if (loading) return <div>Loading memes...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h2>Meme Gallery</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {memes.length === 0 ? (
                    <div>No memes found.</div>
                ) : (
                    memes.map((meme) => (
                        <div key={meme._id} style={{ border: '1px solid #ccc', padding: '8px', width: '220px' }}>
                            <img src={meme.imageUrl} alt={meme.title} style={{ width: '100%' }} />
                            <h4>{meme.title}</h4>
                            <div>Tags: {meme.tags && meme.tags.join(', ')}</div>
                            <p className="text-pink-400">{meme.caption}</p>
                            <p className="text-blue-300 italic">{meme.vibe}</p>
                            <div>Upvotes: {meme.upvotes}
                                <button onClick={() => handleUpvote(meme._id)} style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>▲</button>
                                <button onClick={() => handleDownvote(meme._id)} style={{ marginLeft: 4, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#ff5252', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>▼</button>
                                <button onClick={() => handleDelete(meme._id)} style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#333', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🗑️</button>
                            </div>
                            <div style={{ marginTop: 8, fontWeight: 600 }}>
                                Highest Bid: {meme.highestBid || 0} credits<br />
                                Highest Bidder: {meme.highestBidder || 'None'}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <input
                                    type="number"
                                    min={(meme.highestBid || 0) + 1}
                                    placeholder="Your bid (credits)"
                                    value={bidAmounts[meme._id] || ''}
                                    onChange={e => handleBidChange(meme._id, e.target.value)}
                                    style={{ width: '100%', padding: 4, marginBottom: 4 }}
                                />
                                <button
                                    onClick={() => handleBidSubmit(meme._id)}
                                    style={{ width: '100%', padding: 6, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4 }}
                                >
                                    Place Bid
                                </button>
                                {bidError[meme._id] && <div style={{ color: 'red', marginTop: 4 }}>{bidError[meme._id]}</div>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemeGallery;