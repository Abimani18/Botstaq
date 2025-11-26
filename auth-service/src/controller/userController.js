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

    if (!email || !password)
      return res.status(400).json({ message: "email & password required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcryptUtil.hash(password);

    const user = await User.create({
      email,
      passwordHash,
      name,
      isVerified: false
    });

    // OTP for account verification
    const code = otpUtil.generateNumericOTP(6);
    const expiresAt = otpUtil.buildOtpExpire(OTP_EXPIRY_MIN);

    user.verifyOtp = { code, expiresAt };
    await user.save();

    // send OTP via email-service
    axios.post(EMAIL_SERVICE_URL, {
      to: email,
      subject: "Verify your account",
      text: `Your verification OTP is ${code}. It expires in ${OTP_EXPIRY_MIN} minutes.`
    }).catch(err => console.error("Email Service Error:", err.message));

    return res.status(201).json({
      message: "Registered. Verification OTP sent.",
      userId: user._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "email & otp required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    if (!user.verifyOtp)
      return res.status(400).json({ message: "No OTP found" });

    if (new Date() > new Date(user.verifyOtp.expiresAt))
      return res.status(400).json({ message: "OTP expired" });

    if (user.verifyOtp.code !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.verifyOtp = undefined;
    await user.save();

    return res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const code = otpUtil.generateNumericOTP(6);
    const expiresAt = otpUtil.buildOtpExpire(OTP_EXPIRY_MIN);

    user.verifyOtp = { code, expiresAt };
    await user.save();

    axios.post(EMAIL_SERVICE_URL, {
      to: email,
      subject: "Your new OTP",
      text: `Your new verification OTP is ${code}`
    });

    return res.json({ message: "New OTP sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Account not verified" });

    const ok = await bcryptUtil.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwtUtil.sign({ sub: user._id, email: user.email });
    return res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
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
