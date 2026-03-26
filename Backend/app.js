import express from "express";
// For body-parser, we need to use the default import since it's a CommonJS module
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import booksRoutes from "./routes/booksRoutes.js";
import membersRoutes from "./routes/membersRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

const app = express();

// Middleware
app.use(cors());
// Use body-parser as default import
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/transactions", transactionsRoutes);

export default app;
