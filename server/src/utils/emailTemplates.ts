type EmailTemplateFunction = (
  name: string,
  link: string
) => {
  subject: string;
  html: string;
};

export const emailTemplates: Record<string, EmailTemplateFunction> = {
  en: (name, link) => ({
    subject: "Welcome to Our Community – Verify Your Email ✉️",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #333;">
        <h2 style="color: #1d4ed8;">Hello ${name},</h2>
        <p>We're thrilled to have you join us! 🎉</p>
        <p>Please confirm your email address by clicking the button below.</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="background-color: #1d4ed8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">✅ Verify My Email</a>
        </div>
        <p>This link will expire in <strong>24 hours</strong>.</p>
        <p>If you didn’t sign up, you can ignore this email.</p>
        <p style="margin-top: 40px;">Welcome aboard,</p>
        <p><strong>The Team</strong></p>
      </div>
    `,
  }),

  hu: (name, link) => ({
    subject: "Üdvözlünk – Erősítsd meg az email címed ✉️",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #333;">
        <h2 style="color: #1d4ed8;">Szia ${name}!</h2>
        <p>Örülünk, hogy csatlakoztál hozzánk! 🎉</p>
        <p>Kérlek, erősítsd meg az email címed az alábbi gombbal.</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="background-color: #1d4ed8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">✅ Email megerősítése</a>
        </div>
        <p>A link <strong>24 órán</strong> belül lejár.</p>
        <p>Ha nem te regisztráltál, nyugodtan figyelmen kívül hagyhatod ezt az emailt.</p>
        <p style="margin-top: 40px;">Üdvözlettel,</p>
        <p><strong>A Csapat</strong></p>
      </div>
    `,
  }),

  de: (name, link) => ({
    subject: "Willkommen – Bitte bestätige deine E-Mail-Adresse ✉️",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #333;">
        <h2 style="color: #1d4ed8;">Hallo ${name},</h2>
        <p>Schön, dass du bei uns bist! 🎉</p>
        <p>Bitte bestätige deine E-Mail-Adresse durch Klicken auf den folgenden Button:</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="background-color: #1d4ed8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">✅ E-Mail bestätigen</a>
        </div>
        <p>Dieser Link ist <strong>24 Stunden</strong> gültig.</p>
        <p>Wenn du dich nicht registriert hast, kannst du diese Nachricht ignorieren.</p>
        <p style="margin-top: 40px;">Mit freundlichen Grüßen,</p>
        <p><strong>Dein Team</strong></p>
      </div>
    `,
  }),
};
