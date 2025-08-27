import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import itemsRouter from "./routes/items";
import favoritesRoute from "./routes/favourites";
import registerRouter from "./routes/auth/register";
import loginRouter from "./routes/auth/login";
import refreshTokenRouter from "./routes/auth/refreshToken";
import logoutRouter from "./routes/auth/logout";
import verifyEmailRouter from "./routes/auth/verifyEmail";
import resendVerificationEmailRouter from "./routes/auth/resendVerificationEmail";
import requestResetPasswordRouter from "./routes/auth/requestResetPassword";
import confirmResetPasswordRouter from "./routes/auth/confirmResetPassword";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/items", itemsRouter);
//app.use("/api/favorites", favoritesRoute);
app.use("/api/favourites", favoritesRoute);
app.use("/api/auth/register", registerRouter);
app.use("/api/auth/login", loginRouter);
app.use("/api/auth/refresh-token", refreshTokenRouter);
app.use("/api/auth/logout", logoutRouter);
app.use("/api/auth/verify-email", verifyEmailRouter);
app.use("/api/auth/resend-verification", resendVerificationEmailRouter);
app.use("/api/auth/request-reset-password", requestResetPasswordRouter);
app.use("/api/auth/confirm-reset-password", confirmResetPasswordRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
