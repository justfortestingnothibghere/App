const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  membership: { type: String, enum: ['Best Member', 'Premium Member', 'Ultra Premium Member'], required: true },
  expiry: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

module.exports = mongoose.model('Key', keySchema);