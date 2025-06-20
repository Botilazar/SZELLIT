import express from "express";
import cors from "cors";

import itemsRouter from "./routes/items";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

app.use("/api/items", itemsRouter);

export default app;
