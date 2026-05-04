import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge/PriorityBadge';
import Loader from '../../components/Loader/Loader';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import './Tasks.css';

const Tasks = () => {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Form
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    project: '', assignedTo: '', dueDate: ''
  });

  useEffect(() => {
    fetchAll();
  }, [filterStatus, filterPriority, filterProject]);

  const fetchAll = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterProject) params.project = filterProject;

      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/projects'),
        api.get('/users')
      ]);

      setTasks(tasksRes.data.data);
      setProjects(projectsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, form);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created!');
      }
      closeModal();
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated!');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      title: '', description: '', status: 'todo', priority: 'medium',
      project: projects[0]?._id || '', assignedTo: '', dueDate: ''
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) return <Loader />;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>{tasks.length} task(s)</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="tasks-filters">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      {tasks.length > 0 ? (
        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td className="task-title-cell">{task.title}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {task.project?.name || '-'}
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <div className="task-assignee">
                        <div className="task-assignee-avatar">{getInitials(task.assignedTo.name)}</div>
                        <span style={{ fontSize: 13 }}>{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Unassigned</span>
                    )}
                  </td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td>
                    {(isAdmin || (task.assignedTo?._id === user?.id)) ? (
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </td>
                  <td>
                    <span className={`task-due-date ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  </td>
                  <td>
                    <div className="task-actions">
                      {isAdmin && (
                        <>
                          <button className="btn-icon" onClick={() => openEditModal(task)} title="Edit">
                            <HiOutlinePencil />
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(task._id)} title="Delete"
                            style={{ color: 'var(--color-danger)' }}>
                            <HiOutlineTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3>No Tasks Found</h3>
          <p style={{ marginTop: 8 }}>
            {isAdmin ? 'Create a task to get your team started!' : 'No tasks match your filters.'}
          </p>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="e.g. Design homepage mockup"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Brief description..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Project</label>
              <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required>
                <option value="">Select project...</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
