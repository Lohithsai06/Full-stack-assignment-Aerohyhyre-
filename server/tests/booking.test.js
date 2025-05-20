const { expect } = require('chai');
const { isOverlapping } = require('../models/bookings');

describe('Booking Conflict Detection', () => {
  it('should detect overlapping time slots', () => {
    // Case 1: B starts during A
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T10:30:00Z'),
      new Date('2025-05-22T11:30:00Z')
    )).to.be.true;
    
    // Case 2: B ends during A
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T09:30:00Z'),
      new Date('2025-05-22T10:30:00Z')
    )).to.be.true;
    
    // Case 3: B completely inside A
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T12:00:00Z'),
      new Date('2025-05-22T10:30:00Z'),
      new Date('2025-05-22T11:30:00Z')
    )).to.be.true;
    
    // Case 4: A completely inside B
    expect(isOverlapping(
      new Date('2025-05-22T10:30:00Z'),
      new Date('2025-05-22T11:30:00Z'),
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T12:00:00Z')
    )).to.be.true;
  });
  
  it('should not detect non-overlapping time slots', () => {
    // Case 1: B after A
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T12:00:00Z')
    )).to.be.false;
    
    // Case 2: B before A
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T08:00:00Z'),
      new Date('2025-05-22T09:00:00Z')
    )).to.be.false;
    
    // Case 3: B ends exactly when A starts
    expect(isOverlapping(
      new Date('2025-05-22T10:00:00Z'),
      new Date('2025-05-22T11:00:00Z'),
      new Date('2025-05-22T09:00:00Z'),
      new Date('2025-05-22T10:00:00Z')
    )).to.be.false;
  });
});