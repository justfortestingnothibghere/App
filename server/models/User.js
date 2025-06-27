const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash passwords
  membership: { 
    type: String, 
    enum: ['Free', 'Best Member', 'Premium Member', 'Ultra Premium Member'], 
    default: 'Free' 
  },
  uploadLimit: { type: Number, default: 5 }, // Example restriction: max 5 files for Free users
  storageLimit: { type: Number, default: 100 * 1024 * 1024 } // 100MB for Free users
});

module.exports = mongoose.model('User', userSchema);