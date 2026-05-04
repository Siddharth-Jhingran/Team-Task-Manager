const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admins see all projects
      query = Project.find();
    } else {
      // Members see only projects they belong to
      query = Project.find({ members: req.user.id });
    }

    const projects = await query
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');

    // Add task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
        taskCounts.forEach(tc => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return { ...project.toObject(), taskCounts: counts };
      })
    );

    res.json({ success: true, count: projectsWithCounts.length, data: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is a member or admin
    const isMember = project.members.some(m => m._id.toString() === req.user.id.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, data: { ...project.toObject(), tasks } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a project name' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      createdBy: req.user.id,
      members: members || []
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project and associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin)
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please provide a userId' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin)
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Can't remove the creator
    if (project.createdBy.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project creator' });
    }

    project.members = project.members.filter(
      m => m.toString() !== req.params.userId
    );
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
