const mailer = require('../services/mailService');

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || !subject || (!text && !html)) return res.status(400).json({ message: 'to, subject, text/html required' });

    const info = await mailer.send({ to, subject, text, html });
    res.json({ message: 'sent', info: info.response || info });
  } catch (err) {
    console.error('mail error', err);
    res.status(500).json({ message: 'email send failed' });
  }
};
