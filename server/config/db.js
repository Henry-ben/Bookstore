import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.query("SELECT NOW()", (error, result) => {
    if (error) {
        console.error("Database connection failed:", error);
    } else {
        console.log("Database connected:", result.rows[0]);
    }
});

export default pool;