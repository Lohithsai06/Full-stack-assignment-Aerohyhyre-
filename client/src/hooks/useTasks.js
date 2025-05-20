import { useState, useEffect } from 'react';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to calculate urgency score
  const calculateUrgencyScore = (task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    // Calculate days to deadline (can be negative if overdue)
    const daysToDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    
    // Determine priority weight
    let priorityWeight = 1; // default for low
    if (task.priority === 'high') {
      priorityWeight = 3;
    } else if (task.priority === 'medium') {
      priorityWeight = 2;
    }
    
    // For overdue tasks, make them more urgent by using negative scores
    // Lower score = higher urgency
    if (daysToDeadline < 0) {
      // For overdue tasks, multiply by priority weight to make high priority
      // overdue tasks appear first
      return daysToDeadline * priorityWeight;
    } else {
      // For future tasks, divide by priority weight as before
      return daysToDeadline / priorityWeight;
    }
  };

  // Function to sort tasks by urgency
  const sortTasksByUrgency = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      const scoreA = calculateUrgencyScore(a);
      const scoreB = calculateUrgencyScore(b);
      return scoreA - scoreB; // Lower scores (more urgent) come first
    });
  };

  // Function to fetch tasks from mock API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockTasks = [
        { id: 1, title: "Fix login bug", deadline: "2025-05-20T15:00:00Z", priority: "high" },
        { id: 2, title: "Update landing page", deadline: "2025-05-22T12:00:00Z", priority: "medium" },
        { id: 3, title: "Implement user settings", deadline: "2025-05-25T09:00:00Z", priority: "low" },
        { id: 4, title: "Optimize database queries", deadline: "2025-05-19T10:30:00Z", priority: "high" },
        { id: 5, title: "Write documentation", deadline: "2025-05-28T16:00:00Z", priority: "medium" }
      ];
      
      // Sort tasks by urgency before setting state
      const sortedTasks = sortTasksByUrgency(mockTasks);
      setTasks(sortedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Additional functions for CRUD operations
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
    };
    
    // Add new task and re-sort the list
    const updatedTasks = sortTasksByUrgency([...tasks, newTask]);
    setTasks(updatedTasks);
  };

  const updateTask = (id, updatedTask) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    );
    
    // Re-sort tasks after update
    setTasks(sortTasksByUrgency(updatedTasks));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask
  };
};

export default useTasks;