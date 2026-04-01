import pool from "./config/db.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
  try {
    // First, let's check if the table exists and create it if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Delete any existing admin to avoid conflicts
    await pool.query("DELETE FROM admins WHERE username = ?", ["admin"]);

    // Hash the password
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin
    await pool.query("INSERT INTO admins (username, password) VALUES (?, ?)", [
      "admin",
      hashedPassword,
    ]);

    // Verify the insertion
    const [admins] = await pool.query(
      "SELECT * FROM admins WHERE username = ?",
      ["admin"],
    );
    console.log("Admin user created successfully:");
    console.log("Username:", admins[0].username);
    console.log("Password hash:", admins[0].password);

    // Test the password comparison
    const isMatch = await bcrypt.compare(password, admins[0].password);
    console.log("Password comparison test result:", isMatch);

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
};

createAdmin();
