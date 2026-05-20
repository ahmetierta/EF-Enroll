const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  const nodemailer = require("nodemailer");

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendPasswordResetEmail(email, resetLink) {
  if (!hasSmtpConfig()) {
    console.log("Password reset link:", resetLink);
    return { previewLink: resetLink, skippedEmail: true };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset your EF Enroll password",
    text: `Use this link to reset your password: ${resetLink}`,
    html: `
      <p>You requested a password reset for EF Enroll.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  });

  return { skippedEmail: false };
}

module.exports = {
  frontendUrl,
  sendPasswordResetEmail,
};
