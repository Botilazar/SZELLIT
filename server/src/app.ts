import express from "express";
import cors from "cors";

import itemsRouter from "./routes/items";
import favoritesRoute from "./routes/favourites";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

app.use("/api/items", itemsRouter);
app.use("/api/favorites", favoritesRoute);

export default app;
