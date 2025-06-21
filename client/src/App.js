import React from 'react';
import Header from './Header';
import MemeCreation from './MemeCreation';
import MemeGallery from './MemeGallery';
import Leaderboard from './Leaderboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] pb-12">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Meme Creation Section */}
        <section style={{ marginBottom: 32, background: '#232323', padding: 20, borderRadius: 8 }}>
          <h2 style={{ color: '#fff' }}> Meme Creation </h2>
          <MemeCreation />
        </section>
        {/* Meme Gallery Section */}
        <section style={{ marginBottom: 32, background: '#232323', padding: 20, borderRadius: 8 }}>
          <h2 style={{ color: '#fff' }}>Meme Gallery</h2>
          <MemeGallery />
        </section>
        {/* Leaderboard Section */}
        <section style={{ background: '#232323', padding: 20, borderRadius: 8 }}>
          <h2 style={{ color: '#fff' }}>Leaderboard</h2>
          <Leaderboard />
        </section>
      </main>
    </div>
  );
}

export default App;
