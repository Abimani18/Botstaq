const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 2525);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.error("❌ SMTP CONFIG ERROR:", { host, port, user, pass });
    throw new Error("Missing SMTP configuration");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, // Mailtrap uses TLS = false
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

exports.send = async ({ to, subject, text, html }) => {
  try {
    const t = getTransporter();

    const info = await t.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });

    console.log("📩 Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    throw err;
  }
};
