import React, { useState } from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ tasks, onAddTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  
  const handleAddButtonClick = () => {
    setShowForm(true);
  };
  
  const handleFormSubmit = (newTask) => {
    onAddTask(newTask);
    setShowForm(false);
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="task-list-container">
      <h2>Tasks</h2>
      
      <div className="task-list-content">
        {tasks && tasks.length > 0 ? (
          <ul className="task-items">
            {tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onDelete={onDeleteTask} 
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No tasks available</p>
          </div>
        )}
      </div>
      
      {/* Button with click handler */}
      <div className="add-task-button" onClick={handleAddButtonClick}>
        + Add new task
      </div>
      
      {/* Task form modal */}
      {showForm && (
        <div className="task-form-overlay">
          <div className="task-form-container">
            <h3>Add New Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newTask = {
                title: formData.get('title'),
                deadline: formData.get('deadline'),
                priority: formData.get('priority')
              };
              handleFormSubmit(newTask);
            }}>
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required 
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input 
                  type="datetime-local" 
                  id="deadline" 
                  name="deadline" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" defaultValue="medium">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleFormCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;