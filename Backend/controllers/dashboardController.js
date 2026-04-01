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

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get all statistics in parallel
    const [totalBooks, borrowedBooks, availableBooks, totalMembers] =
      await Promise.all([
        pool.query("SELECT COUNT(*) as count FROM books"),
        pool.query(
          "SELECT COUNT(*) as count FROM transactions WHERE action = 'borrow' AND status = 'Active'",
        ),
        pool.query("SELECT COUNT(*) as count FROM books WHERE quantity > 0"),
        pool.query("SELECT COUNT(*) as count FROM members"),
      ]);

    res.json(
      createResponse({
        totalBooks: totalBooks[0][0].count,
        borrowedBooks: borrowedBooks[0][0].count,
        availableBooks: availableBooks[0][0].count,
        totalMembers: totalMembers[0][0].count,
      }),
    );
  } catch (err) {
    console.error("Error getting dashboard stats:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting dashboard stats: " + err.message,
          500,
        ),
      );
  }
};

// Get active borrowings
export const getActiveBorrowings = async (req, res) => {
  try {
    const [borrowings] = await pool.query(`
      SELECT t.id, t.due_date, t.status, t.created_at as transaction_date,
             m.name as member_name, b.title as book_title,
             DATEDIFF(t.due_date, CURDATE()) as days_remaining,
             DATEDIFF(CURDATE(), t.created_at) as days_elapsed,
             DATEDIFF(t.due_date, t.created_at) as total_days
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      JOIN books b ON t.book_id = b.id
      WHERE t.action = 'borrow' AND t.status = 'Active'
      ORDER BY t.due_date ASC
      LIMIT 5
    `);

    res.json(createResponse(borrowings[0]));
  } catch (err) {
    console.error("Error getting active borrowings:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting active borrowings: " + err.message,
          500,
        ),
      );
  }
};

// Get recently added books
export const getRecentlyAddedBooks = async (req, res) => {
  try {
    const [books] = await pool.query(`
      SELECT id, title, author, created_at
      FROM books
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json(createResponse(books));
  } catch (err) {
    console.error("Error getting recently added books:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting recently added books: " + err.message,
          500,
        ),
      );
  }
};
