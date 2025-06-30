import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // or set host, user, password, dbname individually
    // ssl: { rejectUnauthorized: false } // if using SSL, e.g. on Heroku
});

export default pool;
