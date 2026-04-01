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

// Get all members
export const getAllMembers = async (req, res) => {
  try {
    const [members] = await pool.query("SELECT * FROM members");
    res.status(200).json(createResponse(members));
  } catch (err) {
    console.error("Error getting members:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting members: " + err.message,
          500,
        ),
      );
  }
};

// Get a specific member
export const getMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const [members] = await pool.query("SELECT * FROM members WHERE id = ?", [
      memberId,
    ]);

    if (members.length === 0) {
      return res
        .status(404)
        .json(
          createResponse(
            null,
            false,
            `Member with ID ${memberId} not found`,
            404,
          ),
        );
    }

    res.status(200).json(createResponse(members[0]));
  } catch (err) {
    console.error("Error getting member:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error getting member: " + err.message,
          500,
        ),
      );
  }
};

// Add a new member
export const addMember = async (req, res) => {
  const { name, email, phone, address, status } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res
      .status(400)
      .json(
        createResponse(null, false, "Name, email, and phone are required", 400),
      );
  }

  try {
    // Check if email already exists
    const [existingMembers] = await pool.query(
      "SELECT * FROM members WHERE email = ?",
      [email],
    );
    if (existingMembers.length > 0) {
      return res
        .status(400)
        .json(createResponse(null, false, "Email already exists", 400));
    }

    // Build dynamic query
    let query = "INSERT INTO members (name, email, phone";
    let params = [name, email, phone];

    if (address !== undefined) {
      query += ", address";
      params.push(address);
    }
    if (status !== undefined) {
      query += ", status";
      params.push(status);
    }

    query += ") VALUES (?" + ",?".repeat(params.length - 1) + ")";

    const [result] = await pool.query(query, params);

    // Get the newly created member
    const [newMember] = await pool.query("SELECT * FROM members WHERE id = ?", [
      result.insertId,
    ]);
    res
      .status(201)
      .json(
        createResponse(newMember[0], true, "Member added successfully", 201),
      );
  } catch (err) {
    console.error("Error adding member:", err);
    res
      .status(500)
      .json(
        createResponse(null, false, "Error adding member: " + err.message, 500),
      );
  }
};

// Update a member
export const updateMember = async (req, res) => {
  const { name, email, phone, address, status } = req.body;
  const memberId = req.params.id;

  // Validate required fields
  if (!name || !email || !phone) {
    return res
      .status(400)
      .json(
        createResponse(null, false, "Name, email, and phone are required", 400),
      );
  }

  try {
    // Check if member exists
    const [existingMembers] = await pool.query(
      "SELECT * FROM members WHERE id = ?",
      [memberId],
    );
    if (existingMembers.length === 0) {
      return res
        .status(404)
        .json(
          createResponse(
            null,
            false,
            `Member with ID ${memberId} not found`,
            404,
          ),
        );
    }

    // Check if email is being changed to an existing email
    if (email !== existingMembers[0].email) {
      const [emailCheck] = await pool.query(
        "SELECT * FROM members WHERE email = ? AND id != ?",
        [email, memberId],
      );
      if (emailCheck.length > 0) {
        return res
          .status(400)
          .json(createResponse(null, false, "Email already exists", 400));
      }
    }

    // Build dynamic update query
    let query = "UPDATE members SET name = ?, email = ?, phone = ?";
    let params = [name, email, phone];

    if (address !== undefined) {
      query += ", address = ?";
      params.push(address);
    }
    if (status !== undefined) {
      query += ", status = ?";
      params.push(status);
    }

    query += " WHERE id = ?";
    params.push(memberId);

    await pool.query(query, params);

    // Get the updated member
    const [updatedMember] = await pool.query(
      "SELECT * FROM members WHERE id = ?",
      [memberId],
    );
    res
      .status(200)
      .json(
        createResponse(
          updatedMember[0],
          true,
          "Member updated successfully",
          200,
        ),
      );
  } catch (err) {
    console.error("Error updating member:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error updating member: " + err.message,
          500,
        ),
      );
  }
};

// Delete a member
export const deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;

    // Check if member exists
    const [existingMembers] = await pool.query(
      "SELECT * FROM members WHERE id = ?",
      [memberId],
    );
    if (existingMembers.length === 0) {
      return res
        .status(404)
        .json(
          createResponse(
            null,
            false,
            `Member with ID ${memberId} not found`,
            404,
          ),
        );
    }

    // Delete the member
    await pool.query("DELETE FROM members WHERE id = ?", [memberId]);

    res
      .status(200)
      .json(createResponse(null, true, "Member deleted successfully", 200));
  } catch (err) {
    console.error("Error deleting member:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error deleting member: " + err.message,
          500,
        ),
      );
  }
};

// Search members
export const searchMembers = async (req, res) => {
  const searchTerm = req.query.search || "";
  try {
    // Get the actual columns in the members table
    const [columns] = await pool.query("SHOW COLUMNS FROM members");
    const columnNames = columns.map((col) => col.Field);

    // Build a dynamic query based on available columns
    let query = "SELECT * FROM members";
    const params = [];

    if (searchTerm) {
      const likeClauses = [];
      if (columnNames.includes("name")) likeClauses.push("name LIKE ?");
      if (columnNames.includes("email")) likeClauses.push("email LIKE ?");
      if (columnNames.includes("phone")) likeClauses.push("phone LIKE ?");
      if (columnNames.includes("address")) likeClauses.push("address LIKE ?");
      if (columnNames.includes("status")) likeClauses.push("status LIKE ?");

      if (likeClauses.length > 0) {
        query += " WHERE " + likeClauses.join(" OR ");

        // Add the search term parameter for each column
        for (let i = 0; i < likeClauses.length; i++) {
          params.push(`%${searchTerm}%`);
        }
      }
    }

    const [members] = await pool.query(query, params);
    res.status(200).json(createResponse(members));
  } catch (err) {
    console.error("Error searching members:", err);
    res
      .status(500)
      .json(
        createResponse(
          null,
          false,
          "Error searching members: " + err.message,
          500,
        ),
      );
  }
};
