import express from "express";
import cors from "cors";

import itemsRouter from "./routes/items";
import favoritesRoute from "./routes/favourites";
import registerRouter from "./routes/register";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/items", itemsRouter);
app.use("/api/favorites", favoritesRoute);
app.use("/api/register", registerRouter);
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
