import dotenv from "dotenv";
dotenv.config(); // ✅ Load first!

import app from "./app";
import pool from "./db";

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Error connecting to DB:", err);
  } else {
    console.log("✅ DB connected at:", res.rows[0].now);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
