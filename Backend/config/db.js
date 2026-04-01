import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables explicitly
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "library_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Successfully connected to MySQL database");
    connection.release();
    return pool.query("SELECT 1");
  })
  .then(() => console.log("Database test query successful"))
  .catch((err) => {
    console.error("Error connecting to MySQL database:", err);
    console.error("MySQL Connection Config:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    });
  });

export default pool;
