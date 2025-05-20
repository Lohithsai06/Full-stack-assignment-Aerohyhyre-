import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ onAddTask, onClose }) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !deadline) {
      return;
    }
    
    // Create new task object
    const newTask = {
      title: title.trim(),
      deadline,
      priority
    };
    
    // Call the onAddTask function from props
    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setDeadline('');
    setPriority('medium');
    
    // Close the form
    onClose();
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        <h3>Add New Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="task-deadline">Deadline</label>
            <input
              type="datetime-local"
              id="task-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;