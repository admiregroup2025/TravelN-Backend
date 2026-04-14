import nodemailer from "nodemailer";

// ✅ Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Your function
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your HelloTravel Agent OTP",
    html: `
      <h2>Welcome to HelloTravel!</h2>
      <p>Your 6-digit verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>Do not share it with anyone.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Export
export default sendOTPEmail;