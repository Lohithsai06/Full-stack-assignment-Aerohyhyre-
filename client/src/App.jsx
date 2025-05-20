import React, { useState } from 'react';
import TaskList from './components/tasklist';
import PriorityFilter from './components/PriorityFilter';
import useTasks from './hooks/useTasks';
import './App.css';

function App() {
  const { tasks, loading, error, addTask, deleteTask } = useTasks();
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter tasks based on selected priority
  const filteredTasks = priorityFilter === 'all'
    ? tasks
    : tasks.filter(task => task.priority === priorityFilter);

  return (
    <div className="app">
      <div className="app-header">
        <h1>Task Manager</h1>
        
        <PriorityFilter 
          selectedPriority={priorityFilter} 
          onPriorityChange={setPriorityFilter} 
        />
      </div>
      
      <div className="app-content">
        {loading && <p className="loading-message">Loading tasks...</p>}
        {error && <p className="error-message">{error}</p>}
        
        <TaskList 
          tasks={filteredTasks} 
          onAddTask={addTask} 
          onDeleteTask={deleteTask} 
        />
      </div>
    </div>
  );
}

export default App;