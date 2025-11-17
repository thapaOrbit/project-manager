import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, 
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"TaskHive" <${process.env.GMAIL_USER}>`, // sender
    to,      
    subject,  
    html,     
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent Successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
