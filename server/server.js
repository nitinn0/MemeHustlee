require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const cors = require("cors");
const memeRoutes = require('./routes/memeRoutes');
const bidRoutes = require('./routes/bidRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    }
  };
  
  

// express.json() parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());
app.use(cors({
    origin: 'https://memehustle-8ljr.onrender.com'
}));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/', memeRoutes);
app.use('/', bidRoutes);
app.use('/', auctionRoutes);
const PORT = process.env.PORT || 5000;

// Call connectDB before starting the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

module.exports = { app, server, io, connectDB };
