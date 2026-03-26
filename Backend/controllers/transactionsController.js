import pool from "../config/db.js";

export const getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await pool.query("SELECT * FROM transactions");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTransaction = async (req, res) => {
  const { member_id, book_id, action, due_date, status } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO transactions (member_id, book_id, action, due_date, status) VALUES (?, ?, ?, ?, ?)",
      [member_id, book_id, action, due_date, status],
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        member_id,
        book_id,
        action,
        due_date,
        status,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


