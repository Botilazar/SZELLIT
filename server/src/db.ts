import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Debug logging
//console.log("Environment variables:");
//console.log("DB_HOST:", process.env.DB_HOST);
//console.log("DB_USER:", process.env.DB_USER);
//console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "[HIDDEN]" : "UNDEFINED");
//console.log("DB_NAME:", process.env.DB_NAME);
//console.log("DB_PORT:", process.env.DB_PORT);

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432')
});

export default pool;
