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

// Get sales statistics
export const getSalesStats = async (req, res) => {
  try {
    // Get sales statistics
    const [totalSales, monthlySales, recentSales, topSellingBooks] =
      await Promise.all([
        pool.query("SELECT SUM(amount) as total FROM sales"),
        pool.query(`
        SELECT
          MONTH(sale_date) as month,
          SUM(amount) as total
        FROM sales
        WHERE YEAR(sale_date) = YEAR(CURDATE())
        GROUP BY MONTH(sale_date)
        ORDER BY MONTH(sale_date)
      `),
        pool.query(`
        SELECT s.*, b.title as book_title, m.name as member_name
        FROM sales s
        JOIN books b ON s.book_id = b.id
        JOIN members m ON s.member_id = m.id
        ORDER BY s.sale_date DESC
        LIMIT 10
      `),
        pool.query(`
        SELECT b.id, b.title, COUNT(s.id) as sales_count, SUM(s.amount) as total_amount
        FROM books b
        LEFT JOIN sales s ON b.id = s.book_id
        GROUP BY b.id, b.title
        ORDER BY sales_count DESC, total_amount DESC
        LIMIT 5
      `),
      ]);

    // Format monthly sales data
    const monthlySalesData = Array(12).fill(0);
    monthlySales[0].forEach((item) => {
      monthlySalesData[item.month - 1] = item.total;
    });

    res.json(
      createResponse({
        totalSales: totalSales[0][0].total || 0,
        monthlySales: monthlySalesData,
        recentSales: recentSales[0],
        topSellingBooks: topSellingBooks[0],
      }),
    );
  } catch (err) {
    console.error("Error getting sales stats:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting sales stats: " + err.message,
          500,
        ),
      );
  }
};

// Add a new sale
export const addSale = async (req, res) => {
  const { book_id, member_id, amount, sale_date } = req.body;

  if (!book_id || !member_id || !amount) {
    return res
      .status(400)
      .json(
        createResponse(
          null,
          false,
          "Book, member, and amount are required",
          400,
        ),
      );
  }

  try {
    // Check if book exists and has available quantity
    const [book] = await pool.query(
      "SELECT id, quantity, price FROM books WHERE id = ?",
      [book_id],
    );
    if (book.length === 0) {
      return res
        .status(404)
        .json(createResponse(null, false, "Book not found", 404));
    }

    // Check if member exists
    const [member] = await pool.query("SELECT id FROM members WHERE id = ?", [
      member_id,
    ]);
    if (member.length === 0) {
      return res
        .status(404)
        .json(createResponse(null, false, "Member not found", 404));
    }

    // Record the sale
    const [result] = await pool.query(
      "INSERT INTO sales (book_id, member_id, amount, sale_date) VALUES (?, ?, ?, ?)",
      [book_id, member_id, amount, sale_date || new Date()],
    );

    // Update book quantity
    await pool.query("UPDATE books SET quantity = quantity - 1 WHERE id = ?", [
      book_id,
    ]);

    // Get the newly created sale
    const [newSale] = await pool.query(
      `
      SELECT s.*, b.title as book_title, m.name as member_name
      FROM sales s
      JOIN books b ON s.book_id = b.id
      JOIN members m ON s.member_id = m.id
      WHERE s.id = ?
    `,
      [result.insertId],
    );

    res
      .status(201)
      .json(
        createResponse(newSale[0], true, "Sale recorded successfully", 201),
      );
  } catch (err) {
    console.error("Error adding sale:", err);
    res
      .status(500)
      .json(
        createResponse(null, false, "Error adding sale: " + err.message, 500),
      );
  }
};

// Get all sales
export const getAllSales = async (req, res) => {
  try {
    const [sales] = await pool.query(`
      SELECT s.*, b.title as book_title, m.name as member_name
      FROM sales s
      JOIN books b ON s.book_id = b.id
      JOIN members m ON s.member_id = m.id
      ORDER BY s.sale_date DESC
    `);

    res.json(createResponse(sales));
  } catch (err) {
    console.error("Error getting sales:", err);
    res
      .status(500)
      .json(
        createResponse(null, false, "Error getting sales: " + err.message, 500),
      );
  }
};

// Search sales
export const searchSales = async (req, res) => {
  const searchTerm = req.query.search || "";
  try {
    let query = `
      SELECT s.*, b.title as book_title, m.name as member_name
      FROM sales s
      JOIN books b ON s.book_id = b.id
      JOIN members m ON s.member_id = m.id
    `;

    const params = [];

    if (searchTerm) {
      query += `
        WHERE b.title LIKE ? OR m.name LIKE ?
        ORDER BY s.sale_date DESC
      `;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    } else {
      query += " ORDER BY s.sale_date DESC";
    }

    const [sales] = await pool.query(query, params);
    res.json(createResponse(sales));
  } catch (err) {
    console.error("Error searching sales:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error searching sales: " + err.message,
          500,
        ),
      );
  }
};
