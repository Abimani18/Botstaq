const { v4: uuidv4 } = require('uuid');

exports.generateNumericOTP = (digits = 6) => {
  let otp = '';
  for (let i = 0; i < digits; i++) otp += Math.floor(Math.random() * 10);
  return otp;
};

exports.buildOtpExpire = (minutes = 15) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + Number(minutes));
  return now;
};
