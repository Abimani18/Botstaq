const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: String,
  otp: otpSchema, // store last OTP for forgot/reset
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
