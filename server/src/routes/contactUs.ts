import { Router } from "express";
import { sendContactEmail } from "../services/email.service";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { name, email, message } = req.body;

  if (!message || !email) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  try {
    await sendContactEmail({ name, email, message });
    res.status(200).json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact form send error:", err);
    res.status(500).json({ error: "Failed to send contact message." });
  }
});

export default router;
