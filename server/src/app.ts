import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import itemsRouter from "./routes/items";
import favoritesRoute from "./routes/favourites";
import registerRouter from "./routes/auth/register";
import loginRouter from "./routes/auth/login";
import meRouter from "./routes/auth/me";
import logoutRouter from "./routes/auth/logout";
import verifyEmailRouter from "./routes/auth/verifyEmail";
import resendVerificationEmailRouter from "./routes/auth/resendVerificationEmail";
import requestResetPasswordRouter from "./routes/auth/requestResetPassword";
import confirmResetPasswordRouter from "./routes/auth/confirmResetPassword";
import categoriesRouter from "./routes/categories";
import usersRouter from "./routes/users";
import honorsRouter from "./routes/honors";
import badgesRouter from "./routes/badges";
import contactRouter from "./routes/contactUs";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/items", itemsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/favourites", favoritesRoute);
app.use("/api/users", usersRouter);

//auth part
app.use("/api/auth/register", registerRouter);
app.use("/api/auth/login", loginRouter);
app.use("/api/auth/me", meRouter);
app.use("/api/auth/logout", logoutRouter);
app.use("/api/auth/verify-email", verifyEmailRouter);
app.use("/api/auth/resend-verification", resendVerificationEmailRouter);
app.use("/api/auth/request-reset-password", requestResetPasswordRouter);
app.use("/api/auth/confirm-reset-password", confirmResetPasswordRouter);

//honors and badges
app.use("/api/honors", honorsRouter);
app.use("/api/badges", badgesRouter);

//contant us emailing route
app.use("/api/contact", contactRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
