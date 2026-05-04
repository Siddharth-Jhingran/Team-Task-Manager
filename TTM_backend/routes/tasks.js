const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

// Dashboard stats - must be before /:id to avoid conflict
router.get('/dashboard/stats', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(requireRole('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(requireRole('admin'), deleteTask);

module.exports = router;
