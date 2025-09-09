import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL, // your Gmail
    pass: process.env.NODEMAILER_PASSWORD, // app password
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `Story Dive <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const response = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", response.response);
    return true;
  } catch (error) {
    console.log("❌ Error sending email:", error.message);
    return false;
  }
};

export default sendEmail;

