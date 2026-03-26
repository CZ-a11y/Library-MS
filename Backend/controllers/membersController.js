import pool from "../config/db.js";

// Function to get all members
export const getAllMembers = async (req, res) => {
  try {
    const [members] = await pool.query("SELECT * FROM members");
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to add a new member
export const addMember = async (req, res) => {
  const { name, email, phone, status } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO members (name, email, phone, status) VALUES (?, ?, ?, ?)",
      [name, email, phone, status],
    );
    res.status(201).json({ id: result.insertId, name, email, phone, status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
