const statusConfig = {
  'todo': { label: 'To Do', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  'in-progress': { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  'done': { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig['todo'];

  return (
    <span
      className="badge"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}22`
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: config.color,
        display: 'inline-block'
      }} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
