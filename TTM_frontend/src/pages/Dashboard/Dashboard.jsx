import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Loader from '../../components/Loader/Loader';
import { HiOutlineClipboardList, HiOutlineRefresh, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/tasks/dashboard/stats');
      setData(res.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const stats = data?.stats || { total: 0, todo: 0, 'in-progress': 0, done: 0 };
  const priorities = data?.priorities || { high: 0, medium: 0, low: 0 };
  const totalPriority = priorities.high + priorities.medium + priorities.low || 1;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon"><HiOutlineClipboardList /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card progress animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon"><HiOutlineRefresh /></div>
          <div className="stat-value">{stats['in-progress']}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card done animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon"><HiOutlineCheckCircle /></div>
          <div className="stat-value">{stats.done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card overdue animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-icon"><HiOutlineClock /></div>
          <div className="stat-value">{data?.overdueCount || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="dashboard-section-header">
            <h3>Recent Tasks</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {data?.projectCount || 0} project(s)
            </span>
          </div>
          <div className="dashboard-section-body">
            {data?.recentTasks?.length > 0 ? (
              data.recentTasks.map(task => (
                <div key={task._id} className="dash-task-item">
                  <div className="dash-task-info">
                    <div className="dash-task-title">{task.title}</div>
                    <div className="dash-task-meta">
                      <span>{task.project?.name}</span>
                      {task.assignedTo && <span>• {task.assignedTo.name}</span>}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                No tasks yet. Create a project to get started!
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="dashboard-section animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="dashboard-section-header">
            <h3>Priority Distribution</h3>
          </div>
          <div className="dashboard-section-body">
            <div className="priority-bars">
              <div className="priority-bar-row">
                <span className="priority-bar-label">High</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill high"
                    style={{ width: `${(priorities.high / totalPriority) * 100}%` }}
                  />
                </div>
                <span className="priority-bar-count">{priorities.high}</span>
              </div>
              <div className="priority-bar-row">
                <span className="priority-bar-label">Medium</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill medium"
                    style={{ width: `${(priorities.medium / totalPriority) * 100}%` }}
                  />
                </div>
                <span className="priority-bar-count">{priorities.medium}</span>
              </div>
              <div className="priority-bar-row">
                <span className="priority-bar-label">Low</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill low"
                    style={{ width: `${(priorities.low / totalPriority) * 100}%` }}
                  />
                </div>
                <span className="priority-bar-count">{priorities.low}</span>
              </div>
            </div>

            {/* My Tasks */}
            {data?.myTasks?.length > 0 && (
              <>
                <div style={{
                  padding: '12px 20px 8px',
                  borderTop: '1px solid var(--border-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>
                  My Tasks
                </div>
                {data.myTasks.map(task => (
                  <div key={task._id} className="dash-task-item">
                    <div className="dash-task-info">
                      <div className="dash-task-title">{task.title}</div>
                      <div className="dash-task-meta">
                        <span>{task.project?.name}</span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
