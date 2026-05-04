const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getProjects)
  .post(requireRole('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(requireRole('admin'), updateProject)
  .delete(requireRole('admin'), deleteProject);

router.route('/:id/members')
  .post(requireRole('admin'), addMember);

router.route('/:id/members/:userId')
  .delete(requireRole('admin'), removeMember);

module.exports = router;
