import React, { useState } from 'react';
import axios from 'axios';

const MemeCreation = () => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagsArr.length === 0) {
      setError('Please enter at least one tag.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/meme', {
        title,
        imageUrl,
        tags: tagsArr
      });
      setMessage('Meme created successfully!');
      setTitle('');
      setImageUrl('');
      setTags('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#232323] rounded-xl shadow-lg p-8 max-w-lg mx-auto mb-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-pink-400 mb-6 text-center">Create a Meme</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="px-4 py-2 rounded border border-gray-600 bg-[#181818] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          required
          className="px-4 py-2 rounded border border-gray-600 bg-[#181818] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          required
          className="px-4 py-2 rounded border border-gray-600 bg-[#181818] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button type="submit" className="py-3 rounded bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg transition" disabled={loading}>
          {loading ? 'Creating...' : 'Create Meme'}
        </button>
        {message && <div className="text-green-400 text-center font-semibold">{message}</div>}
        {error && <div className="text-red-400 text-center font-semibold">{error}</div>}
      </form>
    </section>
  );
};

export default MemeCreation; 