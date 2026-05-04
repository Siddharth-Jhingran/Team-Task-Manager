import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge/PriorityBadge';
import Loader from '../../components/Loader/Loader';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineUserAdd } from 'react-icons/hi';
import './Projects.css';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [addMemberId, setAddMemberId] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: formName, description: formDesc });
      toast.success('Project created!');
      setShowModal(false);
      setFormName('');
      setFormDesc('');
      fetchProjects();
    } catch (error) {
      toast.error( error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleViewProject = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      setSelectedProject(res.data.data);
    } catch (error) {
      toast.error('Failed to load project details');
    }
  };

  const handleAddMember = async () => {
    if (!addMemberId) return;
    try {
      await api.post(`/projects/${selectedProject._id}/members`, { userId: addMemberId });
      toast.success('Member added!');
      setAddMemberId('');
      handleViewProject(selectedProject._id);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${selectedProject._id}/members/${userId}`);
      toast.success('Member removed');
      handleViewProject(selectedProject._id);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <Loader />;

  // Project Detail View
  if (selectedProject) {
    const nonMembers = allUsers.filter(u => !selectedProject.members.some(m => m._id === u._id));

    return (
      <div className="projects-page">
        <div className="project-detail">
          <div className="project-detail-header">
            <div className="project-detail-info">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedProject(null)} style={{ marginBottom: 12 }}>
                <HiOutlineArrowLeft /> Back to Projects
              </button>
              <h2>{selectedProject.name}</h2>
              <p>{selectedProject.description || 'No description'}</p>
            </div>
            {isAdmin && (
              <div className="project-detail-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProject(selectedProject._id)}>
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="project-members-section">
            <h3>Team Members ({selectedProject.members.length})</h3>
            <div className="members-list">
              {selectedProject.members.map(member => (
                <div key={member._id} className="member-chip">
                  <div className="member-chip-avatar">{getInitials(member.name)}</div>
                  <span>{member.name}</span>
                  <span className="badge" style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: member.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                    color: member.role === 'admin' ? '#c084fc' : '#93c5fd'
                  }}>{member.role}</span>
                  {isAdmin && member._id !== selectedProject.createdBy?._id && (
                    <button className="member-chip-remove" onClick={() => handleRemoveMember(member._id)}>×</button>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && nonMembers.length > 0 && (
              <div className="add-member-row">
                <select value={addMemberId} onChange={e => setAddMemberId(e.target.value)}>
                  <option value="">Select user to add...</option>
                  {nonMembers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleAddMember}>
                  <HiOutlineUserAdd /> Add
                </button>
              </div>
            )}
          </div>

          {/* Tasks in this project */}
          <div className="project-tasks-section">
            <h3>Tasks ({selectedProject.tasks?.length || 0})</h3>
            <div className="dashboard-section" style={{ marginTop: 12 }}>
              <div className="dashboard-section-body">
                {selectedProject.tasks?.length > 0 ? (
                  selectedProject.tasks.map(task => (
                    <div key={task._id} className="dash-task-item">
                      <div className="dash-task-info">
                        <div className="dash-task-title">{task.title}</div>
                        <div className="dash-task-meta">
                          {task.assignedTo && <span>Assigned to: {task.assignedTo.name}</span>}
                          {task.dueDate && <span>• Due: {formatDate(task.dueDate)}</span>}
                        </div>
                      </div>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    No tasks in this project yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Projects List View
  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>{projects.length} project(s)</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> New Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project, i) => (
            <div
              key={project._id}
              className="project-card"
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => handleViewProject(project._id)}
            >
              <div className="project-card-header">
                <div className="project-card-name">{project.name}</div>
              </div>
              <div className="project-card-desc">{project.description || 'No description'}</div>
              <div className="project-card-stats">
                <div className="project-stat">
                  <span className="project-stat-dot todo"></span>
                  {project.taskCounts?.todo || 0} To Do
                </div>
                <div className="project-stat">
                  <span className="project-stat-dot progress"></span>
                  {project.taskCounts?.['in-progress'] || 0} In Progress
                </div>
                <div className="project-stat">
                  <span className="project-stat-dot done"></span>
                  {project.taskCounts?.done || 0} Done
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-members">
                  {project.members?.slice(0, 3).map(m => (
                    <div key={m._id} className="project-member-avatar" title={m.name}>
                      {getInitials(m.name)}
                    </div>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="project-member-avatar project-member-more">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="project-date">{formatDate(project.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3>No Projects Yet</h3>
          <p style={{ marginTop: 8 }}>
            {isAdmin ? 'Create your first project to get started!' : 'You haven\'t been added to any projects yet.'}
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateProject}>Create Project</button>
          </>
        }
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Website Redesign"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description of the project..."
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
