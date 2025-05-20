import React from 'react';
import './TaskItem.css';

const TaskItem = ({ task, onDelete }) => {
  const { id, title, deadline, priority } = task;
  
  // Format the deadline date for display
  const formatDeadline = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    // Format: May 19, 4:00 PM
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit'
    };
    
    const formattedDate = date.toLocaleString('en-US', options);
    
    return (
      <span className={isOverdue ? 'overdue' : ''}>
        {formattedDate}
        {isOverdue && <span className="overdue-label">(Overdue)</span>}
      </span>
    );
  };

  return (
    <li className={`task-item priority-${priority}`}>
      
      <div className="task-content">
        <h3 className="task-title">{title}</h3>
        <div className="task-details">
          <div className="task-deadline">
            <span className="label">Deadline:</span> {formatDeadline(deadline)}
          </div>
          <div className="task-priority">
            <span className="label">Priority:</span> {priority}
          </div>
        </div>
      </div>
      <button 
        className="delete-task-button" 
        onClick={() => onDelete(id)}
        aria-label="Delete task"
      >
        ×
      </button>
    </li>
  );
};

export default TaskItem;