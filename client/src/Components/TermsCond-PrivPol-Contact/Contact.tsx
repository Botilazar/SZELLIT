import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contactMail = import.meta.env.VITE_CONTACT_RECEIVER;
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError(t("contact.invalidEmail") || "Please enter a valid email.");
      return;
    }

    if (!message || message.trim().length < 5) {
      setError(
        t("contact.messageTooShort") ||
          "Message must be at least 5 characters long."
      );
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send message.");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{t("contact.title")}</h1>

      {submitted ? (
        <p className="text-green-600">{t("contact.thanks")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">{t("contact.yourName")}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("contact.namePlaceholder")}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">{t("contact.yourEmail")}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("contact.emailPlaceholder")}
            />
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">
              {t("contact.yourMessage")}
            </label>
            <textarea
              required
              className="w-full px-4 py-2 border rounded-md"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("contact.messagePlaceholder")}
            />
          </div>

          {/* Error + Button */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-gray-600">
        {t("contact.otherContact")}{" "}
        <a href={`mailto: ${contactMail}`} className="underline">
          {contactMail}
        </a>
      </p>
    </div>
  );
};

export default Contact;
