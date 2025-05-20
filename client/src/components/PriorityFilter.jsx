import React from 'react';
import './PriorityFilter.css';

const PriorityFilter = ({ selectedPriority, onPriorityChange }) => {
  return (
    <div className="priority-filter">
      <label htmlFor="priority-select">Filter by priority:</label>
      <select
        id="priority-select"
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
      >
        <option value="all">All Tasks</option>
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>
    </div>
  );
};

export default PriorityFilter;