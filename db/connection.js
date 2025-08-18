const mongoose = require('mongoose')

const connection = () => {
    if (!process.env.MONGO_URL) {
        console.error('MONGO_URL environment variable is not set');
        return;
    }
    
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 seconds
    }).then(() => {
        console.log('✅ MongoDB connected successfully');
    }).catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });
}

module.exports = connection;



