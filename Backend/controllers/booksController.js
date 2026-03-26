import pool from "../config/db.js";

export const getAllBooks = async (req, res) => {
  try {
    const [books] = await pool.query("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addBook = async (req, res) => {
  const { title, author, category, isbn, quantity } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO books (title, author, category, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title, author, category, isbn, quantity],
    );
    res
      .status(201)
      .json({ id: result.insertId, title, author, category, isbn, quantity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
