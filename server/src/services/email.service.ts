import nodemailer from "nodemailer";
import { emailTemplates } from "../utils/emailTemplates";

const transporter = nodemailer.createTransport({
  service: "gmail", // change this for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  verificationLink: string,
  lng: string = "en"
) => {
  const template = emailTemplates[lng] || emailTemplates.en;
  const { subject, html } = template(fullName, verificationLink);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
};

export const sendResetPWEmail = async (
  email: string,
  resetLink: string,
  fullName: string
) => {
  const subject = "Reset your password";
  const html = `
    <h2>Password Reset</h2>
    <p>Hello ${fullName || "there"},</p>
    <p>You requested to reset your password.</p>
    <p>Click the link below to choose a new one:</p>
    <a href="${resetLink}" target="_blank">${resetLink}</a>
    <p>If you didn’t request this, you can safely ignore this email.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
};
