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
  fullName: string,
  resetLink: string
) => {
  const subject = "Reset your password";
  const html = `
    <h2>Password Reset</h2>
    <p>Hello ${fullName || "there"},</p>
    <p>You requested to reset your password.</p>
    <p>Click the link below to choose a new one:</p>
    <a href="${resetLink}" target="_blank">Reset your password with this link.</a>
    <p>If you didn’t request this, you can safely ignore this email.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
};

/* Send Contact Form Message from the /Contact page.tsx */
export const sendContactEmail = async ({
  name,
  email,
  message,
}: {
  name?: string;
  email: string;
  message: string;
}) => {
  if (!email || !email.includes("@")) {
    throw new Error("A valid email address is required.");
  }
  if (!message || message.trim().length < 5) {
    throw new Error("Message must be at least 5 characters long.");
  }
  const receiver = process.env.CONTACT_RECEIVER || process.env.EMAIL_FROM;
  const subject = `New contact form message from ${name || "Website User"}`;

  const html = `
    <h2>New Contact Form Message</h2>
    <p><strong>From:</strong> ${name || "Anonymous"} &lt;${email}&gt;</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p>This message was sent from the Szellit contact form.</p>
  `;
  try {
    await transporter.sendMail({
      from: `"Szellit Contact" <${process.env.EMAIL_FROM}>`,
      to: receiver,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw new Error("Failed to send contact message. Please try again later.");
  }

  // Send confirmation email to the sender, that we received their message.
  const confirmHtml = `<p>Hi ${name || "there"},</p>
    <p>Thanks for reaching out! We’ve received your message and will get back to you soon.</p>
    <p>— The Szellit Team</p>`;

  try {
    await transporter.sendMail({
      from: `"Szellit Support" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "We’ve received your message",
      html: confirmHtml,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};
