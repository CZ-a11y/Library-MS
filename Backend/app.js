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
// Configure CORS to allow requests from your frontend
// In your backend app.js
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Or your specific frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true
}));
// Use body-parser as default import
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/transactions", transactionsRoutes);

export default app;
// {

// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzc0NjcwMTE1LCJleHAiOjE3NzQ2NzM3MTV9.IBcm26RY6fYp4n2ON11-86TMsFD9zOL3nt641D91VC4"

// }
