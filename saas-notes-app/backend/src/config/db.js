const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yardstick-notes';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB connected: ${mongoURI}`);
    return true;
  } 
  catch(error){
    console.error('❌ MongoDB connection error:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return false;
  }
};

module.exports = connectDB;