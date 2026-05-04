const priorityConfig = {
  'low': { label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  'medium': { label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  'high': { label: 'High', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' }
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig['medium'];

  return (
    <span
      className="badge"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}22`
      }}
    >
      {priority === 'high' && '↑ '}
      {priority === 'low' && '↓ '}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
