import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';
import toast from 'react-hot-toast';
import './Team.css';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
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

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h2>Team Members</h2>
          <p>{users.length} member(s)</p>
        </div>
      </div>

      <div className="team-grid">
        {users.map((member, i) => (
          <div
            key={member._id}
            className="team-card"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="team-avatar">{getInitials(member.name)}</div>
            <div className="team-info">
              <div className="team-name">{member.name}</div>
              <div className="team-email">{member.email}</div>
              <div className="team-joined">Joined {formatDate(member.createdAt)}</div>
            </div>
            <span className={`team-role-badge ${member.role}`}>
              {member.role === 'admin' ? '⚡ Admin' : '👤 Member'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
