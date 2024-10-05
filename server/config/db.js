const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        console.log(`MongoDB connected to: ${connection.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const db = mongoose.connection;
db.on('connected', () => {
    console.log(`Connected to MongoDB database: ${db.name}`);
});

module.exports = { connectToDatabase };

