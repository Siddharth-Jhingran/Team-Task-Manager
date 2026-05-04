const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, assignedTo } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Non-admin users only see tasks from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user.id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      filter.project = filter.project
        ? { $in: [filter.project].filter(id => projectIds.some(pid => pid.toString() === id)) }
        : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, assignedTo, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ success: false, message: 'Please provide title and project' });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      dueDate: dueDate || null
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role !== 'admin') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id.toString();
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      // Members can only update status
      const allowedFields = { status: req.body.status };
      task = await Task.findByIdAndUpdate(req.params.id, allowedFields, {
        new: true,
        runValidators: true
      })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    } else {
      // Admin can update everything
      task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/tasks/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    let projectFilter = {};

    // Non-admin: only see stats from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user.id }).select('_id');
      projectFilter.project = { $in: userProjects.map(p => p._id) };
    }

    // Total tasks by status
    const statusCounts = await Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Priority distribution
    const priorityCounts = await Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Overdue tasks (due date < now and status != done)
    const overdueCount = await Task.countDocuments({
      ...projectFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });

    // Total projects count
    let projectCount;
    if (req.user.role === 'admin') {
      projectCount = await Project.countDocuments();
    } else {
      projectCount = await Project.countDocuments({ members: req.user.id });
    }

    // Recent tasks
    const recentTasks = await Task.find(projectFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .limit(5);

    // My tasks (assigned to current user)
    const myTasks = await Task.find({ ...projectFilter, assignedTo: req.user.id })
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(5);

    const stats = {
      todo: 0,
      'in-progress': 0,
      done: 0,
      total: 0
    };

    statusCounts.forEach(sc => {
      stats[sc._id] = sc.count;
      stats.total += sc.count;
    });

    const priorities = { low: 0, medium: 0, high: 0 };
    priorityCounts.forEach(pc => {
      priorities[pc._id] = pc.count;
    });

    res.json({
      success: true,
      data: {
        stats,
        priorities,
        overdueCount,
        projectCount,
        recentTasks,
        myTasks
      }
    });
  } catch (error) {
    next(error);
  }
};
