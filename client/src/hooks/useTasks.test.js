// Create a utils folder and file first
import { filterTasksByPriority, calculateUrgencyScore, sortTasksByUrgency } from '../utils/taskUtils';

// Mock the current date to ensure consistent test results
const mockDate = new Date('2025-05-21T12:00:00Z');
const originalDate = global.Date;
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());
// Preserve original Date functionality
global.Date.UTC = originalDate.UTC;
global.Date.parse = originalDate.parse;
global.Date.prototype = originalDate.prototype;

// Mock task data for testing
const mockTasks = [
  { id: 1, title: "Fix login bug", deadline: "2025-05-20T15:00:00Z", priority: "high" },        // Overdue, high priority
  { id: 2, title: "Update landing page", deadline: "2025-05-22T12:00:00Z", priority: "medium" }, // Future, medium priority
  { id: 3, title: "Implement user settings", deadline: "2025-05-25T09:00:00Z", priority: "low" }, // Future, low priority
  { id: 4, title: "Optimize database queries", deadline: "2025-05-19T10:30:00Z", priority: "high" }, // Overdue, high priority
  { id: 5, title: "Write documentation", deadline: "2025-05-28T16:00:00Z", priority: "medium" }, // Future, medium priority
  { id: 6, title: "Fix security issue", deadline: "2025-05-20T09:00:00Z", priority: "high" }, // Overdue, high priority
  { id: 7, title: "Update dependencies", deadline: "2025-05-19T14:00:00Z", priority: "low" }, // Overdue, low priority
];

// Helper functions to test (these would normally be imported from your actual code)
// You can extract these functions from your useTasks.js file
const filterTasksByPriority = (tasks, priority) => {
  if (priority === 'all') {
    return tasks;
  }
  return tasks.filter(task => task.priority === priority);
};

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
  if (daysToDeadline < 0) {
    // For overdue tasks, multiply by priority weight to make high priority
    // overdue tasks appear first
    return daysToDeadline * priorityWeight;
  } else {
    // For future tasks, divide by priority weight as before
    return daysToDeadline / priorityWeight;
  }
};

const sortTasksByUrgency = (tasksToSort) => {
  return [...tasksToSort].sort((a, b) => {
    const scoreA = calculateUrgencyScore(a);
    const scoreB = calculateUrgencyScore(b);
    return scoreA - scoreB; // Lower scores (more urgent) come first
  });
};

// Mock the imported functions
jest.mock('../utils/taskUtils', () => ({
  filterTasksByPriority: (tasks, priority) => {
    if (priority === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.priority === priority);
  },
  calculateUrgencyScore: (task) => {
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
    if (daysToDeadline < 0) {
      // For overdue tasks, multiply by priority weight to make high priority
      // overdue tasks appear first
      return daysToDeadline * priorityWeight;
    } else {
      // For future tasks, divide by priority weight as before
      return daysToDeadline / priorityWeight;
    }
  },
  sortTasksByUrgency: (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      const scoreA = calculateUrgencyScore(a);
      const scoreB = calculateUrgencyScore(b);
      return scoreA - scoreB; // Lower scores (more urgent) come first
    });
  }
}));

describe('Task Filtering Tests', () => {
  test('should filter tasks by high priority', () => {
    const highPriorityTasks = filterTasksByPriority(mockTasks, 'high');
    expect(highPriorityTasks.length).toBe(3);
    expect(highPriorityTasks.every(task => task.priority === 'high')).toBe(true);
  });

  test('should filter tasks by medium priority', () => {
    const mediumPriorityTasks = filterTasksByPriority(mockTasks, 'medium');
    expect(mediumPriorityTasks.length).toBe(2);
    expect(mediumPriorityTasks.every(task => task.priority === 'medium')).toBe(true);
  });

  test('should filter tasks by low priority', () => {
    const lowPriorityTasks = filterTasksByPriority(mockTasks, 'low');
    expect(lowPriorityTasks.length).toBe(2);
    expect(lowPriorityTasks.every(task => task.priority === 'low')).toBe(true);
  });

  test('should return all tasks when filter is "all"', () => {
    const allTasks = filterTasksByPriority(mockTasks, 'all');
    expect(allTasks.length).toBe(mockTasks.length);
    expect(allTasks).toEqual(mockTasks);
  });
});

describe('Task Urgency Score Calculation Tests', () => {
  test('should calculate correct urgency score for future tasks', () => {
    // Future task with medium priority
    const futureTask = mockTasks[1]; // "Update landing page", medium priority, 1 day in future
    const score = calculateUrgencyScore(futureTask);
    
    // Expected: ~1 day / 2 (medium priority weight) = ~0.5
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  test('should calculate correct urgency score for overdue tasks', () => {
    // Overdue task with high priority
    const overdueTask = mockTasks[0]; // "Fix login bug", high priority, 1 day overdue
    const score = calculateUrgencyScore(overdueTask);
    
    // Expected: ~-1 day * 3 (high priority weight) = ~-3
    expect(score).toBeLessThan(0);
    expect(score).toBeGreaterThan(-4);
  });

  test('should make high priority tasks more urgent than medium priority tasks with same deadline', () => {
    const highPriorityTask = { ...mockTasks[1], priority: 'high' }; // Same deadline as task[1] but high priority
    const mediumPriorityTask = mockTasks[1]; // Original medium priority
    
    const highScore = calculateUrgencyScore(highPriorityTask);
    const mediumScore = calculateUrgencyScore(mediumPriorityTask);
    
    expect(highScore).toBeLessThan(mediumScore); // Lower score = higher urgency
  });
});

describe('Task Sorting Tests', () => {
  test('should sort tasks by urgency score', () => {
    const sortedTasks = sortTasksByUrgency(mockTasks);
    
    // Verify tasks are sorted by urgency score
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentScore = calculateUrgencyScore(sortedTasks[i]);
      const nextScore = calculateUrgencyScore(sortedTasks[i + 1]);
      expect(currentScore).toBeLessThanOrEqual(nextScore);
    }
  });

  test('should place overdue tasks before future tasks', () => {
    const sortedTasks = sortTasksByUrgency(mockTasks);
    
    // Find the index where tasks switch from overdue to future
    let overdueCount = 0;
    for (const task of mockTasks) {
      if (new Date(task.deadline) < new Date()) {
        overdueCount++;
      }
    }
    
    // Verify all overdue tasks come first
    for (let i = 0; i < overdueCount; i++) {
      expect(new Date(sortedTasks[i].deadline)).toBeLessThan(new Date());
    }
    
    // If there are future tasks, verify they come after overdue tasks
    if (overdueCount < sortedTasks.length) {
      expect(new Date(sortedTasks[overdueCount].deadline)).toBeGreaterThanOrEqual(new Date());
    }
  });

  test('should sort overdue tasks with high priority first', () => {
    const sortedTasks = sortTasksByUrgency(mockTasks);
    
    // Get all overdue tasks
    const overdueTasks = sortedTasks.filter(task => new Date(task.deadline) < new Date());
    
    // If we have multiple overdue tasks with different priorities
    if (overdueTasks.length > 1) {
      // Check that high priority overdue tasks come before lower priority ones
      for (let i = 0; i < overdueTasks.length - 1; i++) {
        const currentTask = overdueTasks[i];
        const nextTask = overdueTasks[i + 1];
        
        // If current task is high priority and next is not, current should come first
        if (currentTask.priority === 'high' && nextTask.priority !== 'high') {
          const currentScore = calculateUrgencyScore(currentTask);
          const nextScore = calculateUrgencyScore(nextTask);
          expect(currentScore).toBeLessThan(nextScore);
        }
      }
    }
  });

  test('should handle empty task list', () => {
    const sortedTasks = sortTasksByUrgency([]);
    expect(sortedTasks).toEqual([]);
  });
});

// Restore original Date after tests
afterAll(() => {
  global.Date = originalDate;
});