const axios = require('axios');
const User = require('../model/userModel');
const bcryptUtil = require('../utils/bcrypt');
const jwtUtil = require('../utils/jwt');
const otpUtil = require('../utils/otp');

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL; 
const OTP_EXPIRY_MIN = process.env.OTP_EXPIRY_MIN || 15;

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcryptUtil.hash(password);
    const user = await User.create({ email, passwordHash, name });

    // send welcome mail (fire and forget)
    if (EMAIL_SERVICE_URL) {
      axios.post(EMAIL_SERVICE_URL, {
        to: email,
        subject: 'Welcome!',
        text: `Hi ${name || ''}, welcome!`
      }).catch(err => console.error('Email send failed:', err.message));
    }

    return res.status(201).json({ message: 'Registered', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcryptUtil.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwtUtil.sign({ sub: user._id, email: user.email });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = otpUtil.generateNumericOTP(6);
    const expiresAt = otpUtil.buildOtpExpire(OTP_EXPIRY_MIN);

    user.otp = { code, expiresAt };
    await user.save();

    // ask email-service to send the OTP
    if (EMAIL_SERVICE_URL) {
      axios.post(EMAIL_SERVICE_URL, {
        to: email,
        subject: 'Your OTP code',
        text: `Your OTP is ${code}. It expires in ${OTP_EXPIRY_MIN} minutes.`
      }).catch(err => console.error('Email send failed:', err.message));
    }

    res.json({ message: 'OTP sent if email exists' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.reset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'email, otp, newPassword required' });

    const user = await User.findOne({ email });
    if (!user || !user.otp) return res.status(400).json({ message: 'Invalid OTP' });

    if (user.otp.code !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(user.otp.expiresAt)) return res.status(400).json({ message: 'OTP expired' });

    user.passwordHash = await bcryptUtil.hash(newPassword);
    user.otp = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};
