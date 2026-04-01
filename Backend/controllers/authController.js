import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  console.log("Login attempt:", req.body);

  if (!req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const { username, password } = req.body;

  try {
    const [admins] = await pool.query(
      "SELECT * FROM admins WHERE username = ?",
      [username],
    );

    if (admins.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const admin = admins[0];
    console.log("Stored hash:", admin.password);
    console.log("Password to compare:", password);

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
