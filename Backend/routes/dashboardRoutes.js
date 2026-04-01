import express from 'express';
import {
  getDashboardStats,
  getActiveBorrowings,
  getRecentlyAddedBooks
} from '../controllers/dashboardController.js';

const router = express.Router();

// Define routes with proper paths
router.get('/stats', getDashboardStats);
router.get('/active-borrowings', getActiveBorrowings);
router.get('/recent-books', getRecentlyAddedBooks);

export default router;