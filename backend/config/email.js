const { email, frontendUrl } = require("./env");

function hasSmtpConfig() {
  return Boolean(email.smtpHost && email.smtpUser && email.smtpPass);
}

function createTransporter() {
  const nodemailer = require("nodemailer");

  return nodemailer.createTransport({
    host: email.smtpHost,
    port: email.smtpPort,
    secure: email.smtpSecure,
    auth: {
      user: email.smtpUser,
      pass: email.smtpPass,
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
    from: email.smtpFrom,
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
