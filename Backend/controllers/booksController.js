import pool from "../config/db.js";

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const [books] = await pool.query("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    console.error("Error getting books:", err);
    res.status(500).json({ message: "Error getting books" });
  }
};

// Get a specific book
export const getBook = async (req, res) => {
  try {
    const [books] = await pool.query("SELECT * FROM books WHERE id = ?", [
      req.params.id,
    ]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(books[0]);
  } catch (err) {
    console.error("Error getting book:", err);
    res.status(500).json({ message: "Error getting book" });
  }
};

// Add a new book
export const addBook = async (req, res) => {
  const { title, author, category, isbn, quantity } = req.body;

  if (!title || !author || !category || !isbn || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO books (title, author, category, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title, author, category, isbn, quantity],
    );

    const [newBook] = await pool.query("SELECT * FROM books WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newBook[0]);
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).json({ message: "Error adding book" });
  }
};

// Update a book
export const updateBook = async (req, res) => {
  const { title, author, category, isbn, quantity } = req.body;
  const bookId = req.params.id;

  if (!title || !author || !category || !isbn || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // First check if book exists
    const [existingBooks] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [bookId],
    );
    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Update the book
    await pool.query(
      "UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, quantity = ? WHERE id = ?",
      [title, author, category, isbn, quantity, bookId],
    );

    // Get the updated book
    const [updatedBook] = await pool.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);
    res.json(updatedBook[0]);
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ message: "Error updating book" });
  }
};

// Delete a book
export const deleteBook = async (req, res) => {
  try {
    // First check if book exists
    const [existingBooks] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id],
    );
    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete the book
    await pool.query("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ message: "Error deleting book" });
  }
};
// In booksController.js
export const searchBooks = async (req, res) => {
  const searchTerm = req.query.search || "";
  try {
    const [books] = await pool.query(
      "SELECT * FROM books WHERE " +
        "title LIKE ? OR " +
        "author LIKE ? OR " +
        "isbn LIKE ? OR " +
        "category LIKE ?",
      [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
      ],
    );
    res.json(books);
  } catch (err) {
    console.error("Error searching books:", err);
    res.status(500).json({ message: "Error searching books" });
  }
};
