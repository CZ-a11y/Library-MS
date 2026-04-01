import pool from "../config/db.js";

// Helper function to standardize responses
function createResponse(
  data = null,
  success = true,
  message = "",
  status = 200,
) {
  return {
    success,
    message,
    data,
    status,
  };
}

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    // Check the actual column names in your database
    const [transactions] = await pool.query(`
      SELECT t.*, m.name as member_name, b.title as book_title,
             t.created_at as transaction_date, t.due_date
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      JOIN books b ON t.book_id = b.id
      ORDER BY t.created_at DESC
    `);
    res.json(createResponse(transactions));
  } catch (err) {
    console.error("Error getting transactions:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting transactions: " + err.message,
          500,
        ),
      );
  }
};

// Create a new transaction
export const createTransaction = async (req, res) => {
  const { member_id, book_id, action, due_date } = req.body;

  if (!member_id || !book_id || !action || !due_date) {
    return res
      .status(400)
      .json(
        createResponse(
          null,
          false,
          "Member, book, action, and due date are required",
          400,
        ),
      );
  }

  try {
    // Check if book is available for borrowing
    if (action === "borrow") {
      const [activeBorrowings] = await pool.query(
        "SELECT * FROM transactions WHERE book_id = ? AND action = 'borrow' AND status = 'Active'",
        [book_id],
      );

      if (activeBorrowings.length > 0) {
        return res
          .status(400)
          .json(createResponse(null, false, "Book is already borrowed", 400));
      }
    }

    // Create transaction
    const [result] = await pool.query(
      "INSERT INTO transactions (member_id, book_id, action, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [
        member_id,
        book_id,
        action,
        due_date,
        action === "borrow" ? "Active" : "Returned",
      ],
    );

    // Get the newly created transaction
    const [newTransaction] = await pool.query(
      `
      SELECT t.*, m.name as member_name, b.title as book_title,
             t.created_at as transaction_date, t.due_date
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      JOIN books b ON t.book_id = b.id
      WHERE t.id = ?
    `,
      [result.insertId],
    );

    res
      .status(201)
      .json(
        createResponse(
          newTransaction[0],
          true,
          "Transaction recorded successfully",
          201,
        ),
      );
  } catch (err) {
    console.error("Error creating transaction:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error creating transaction: " + err.message,
          500,
        ),
      );
  }
};

// Search transactions
export const searchTransactions = async (req, res) => {
  const searchTerm = req.query.search || "";
  try {
    let query = `
      SELECT t.*, m.name as member_name, b.title as book_title,
             t.created_at as transaction_date, t.due_date
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      JOIN books b ON t.book_id = b.id
    `;

    const params = [];

    if (searchTerm) {
      query += `
        WHERE m.name LIKE ? OR b.title LIKE ? OR t.action LIKE ?
        ORDER BY t.created_at DESC
      `;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    } else {
      query += " ORDER BY t.created_at DESC";
    }

    const [transactions] = await pool.query(query, params);
    res.json(createResponse(transactions));
  } catch (err) {
    console.error("Error searching transactions:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error searching transactions: " + err.message,
          500,
        ),
      );
  }
};

// Load dropdown data
export const loadDropdownData = async (req, res) => {
  try {
    const [members, books] = await Promise.all([
      pool.query("SELECT id, name FROM members"),
      pool.query("SELECT id, title FROM books"),
    ]);

    res.json(
      createResponse({
        members: members[0],
        books: books[0],
      }),
    );
  } catch (err) {
    console.error("Error loading dropdown data:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error loading dropdown data: " + err.message,
          500,
        ),
      );
  }
};
