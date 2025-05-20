/**
 * minMeetingRooms - Calculates the minimum number of meeting rooms required
 * to host all events without overlaps.
 * 
 * Time Complexity: O(n log n) where n is the number of events
 * Space Complexity: O(n)
 * 
 * @param {Array} events - Array of objects with start and end times
 * @returns {Number} - Minimum number of rooms required
 */
function minMeetingRooms(events) {
  // Edge case: if no events, return 0
  if (!events || events.length === 0) return 0;
  
  // Extract all start and end times and sort them
  const starts = events.map(event => event.start).sort((a, b) => a - b);
  const ends = events.map(event => event.end).sort((a, b) => a - b);
  
  let rooms = 0;      // Current number of rooms needed
  let maxRooms = 0;   // Maximum number of rooms needed at any point
  let startPtr = 0;   // Pointer for start times array
  let endPtr = 0;     // Pointer for end times array
  
  // Process all start and end times in chronological order
  while (startPtr < starts.length) {
    // If the earliest start time is before the earliest end time,
    // we need another room
    if (starts[startPtr] < ends[endPtr]) {
      rooms++;
      startPtr++;
      // Update maximum rooms if current count is higher
      maxRooms = Math.max(maxRooms, rooms);
    } 
    // If an event ends before or at the same time as the next event starts,
    // we can reuse a room
    else {
      rooms--;
      endPtr++;
    }
  }
  
  return maxRooms;
}

/**
 * Assigns events to specific rooms
 * @param {Array} events - Array of objects with start and end times
 * @returns {Object} - Object containing room assignments and total rooms
 */
function assignRooms(events) {
  if (!events || events.length === 0) return { totalRooms: 0, assignments: [] };
  
  // Create a copy of events with original indices
  const eventsWithIndex = events.map((event, index) => ({
    ...event,
    originalIndex: index
  }));
  
  // Sort events by start time
  eventsWithIndex.sort((a, b) => a.start - b.start);
  
  // Room assignments
  const assignments = new Array(events.length);
  
  // Available rooms (min heap simulation using array)
  const availableRooms = [];
  let roomCounter = 0;
  
  for (const event of eventsWithIndex) {
    // Check if any room is available
    if (availableRooms.length === 0 || availableRooms[0].endTime > event.start) {
      // No room available, create a new one
      roomCounter++;
      const roomId = roomCounter;
      assignments[event.originalIndex] = { roomId, start: event.start, end: event.end };
      
      // Add to available rooms (will be available after this event ends)
      availableRooms.push({ roomId, endTime: event.end });
      
      // Sort by end time (simulating min heap)
      availableRooms.sort((a, b) => a.endTime - b.endTime);
    } else {
      // Reuse the earliest available room
      const room = availableRooms.shift();
      assignments[event.originalIndex] = { roomId: room.roomId, start: event.start, end: event.end };
      
      // Update room availability
      room.endTime = event.end;
      availableRooms.push(room);
      
      // Sort by end time (simulating min heap)
      availableRooms.sort((a, b) => a.endTime - b.endTime);
    }
  }
  
  return {
    totalRooms: roomCounter,
    assignments
  };
}

/**
 * Generates an explanation of the algorithm's decision
 * @param {Array} events - Array of objects with start and end times
 * @returns {String} - Explanation text
 */
function generateExplanation(events) {
  if (!events || events.length === 0) return "No events to schedule.";
  
  // Sort events by start time for explanation
  const sortedEvents = [...events].sort((a, b) => a.start - b.start);
  
  let explanation = "Algorithm explanation:\n";
  explanation += "1. We sort all events by start time and process them in order.\n";
  explanation += "2. For each event, we either allocate a new room or reuse an existing one.\n\n";
  explanation += "Event timeline:\n";
  
  sortedEvents.forEach((event, i) => {
    explanation += `Event ${i+1}: [${event.start}-${event.end}]\n`;
  });
  
  // Find overlapping events for explanation
  const overlaps = [];
  for (let i = 0; i < sortedEvents.length; i++) {
    for (let j = i + 1; j < sortedEvents.length; j++) {
      if (sortedEvents[i].start < sortedEvents[j].end && 
          sortedEvents[j].start < sortedEvents[i].end) {
        overlaps.push([i+1, j+1]);
      }
    }
  }
  
  if (overlaps.length > 0) {
    explanation += "\nOverlapping events:\n";
    overlaps.forEach(pair => {
      explanation += `Events ${pair[0]} and ${pair[1]} overlap and need separate rooms.\n`;
    });
  } else {
    explanation += "\nNo overlapping events found, so only one room is needed.\n";
  }
  
  return explanation;
}

// Predefined test cases
const testCases = [
  {
    name: "Example from problem statement",
    events: [
      { start: 0, end: 30 },
      { start: 5, end: 10 },
      { start: 15, end: 20 }
    ]
  },
  {
    name: "All meetings overlap",
    events: [
      { start: 1, end: 10 },
      { start: 2, end: 11 },
      { start: 3, end: 12 },
      { start: 4, end: 13 }
    ]
  },
  {
    name: "No overlaps",
    events: [
      { start: 1, end: 5 },
      { start: 5, end: 10 },
      { start: 10, end: 15 },
      { start: 15, end: 20 }
    ]
  },
  {
    name: "Complex overlaps",
    events: [
      { start: 1, end: 10 },
      { start: 2, end: 7 },
      { start: 3, end: 19 },
      { start: 8, end: 12 },
      { start: 10, end: 20 },
      { start: 11, end: 30 }
    ]
  }
];

// Start the CLI
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Clear screen and show welcome message
console.clear();
console.log("🏢 Meeting Room Calculator 🏢");
console.log("============================");
console.log("Calculate the minimum number of meeting rooms required");
console.log("for a set of events without overlaps.\n");

// Main menu
function showMainMenu() {
  console.log("\nPlease select an option:");
  console.log("1. Use a predefined test case");
  console.log("2. Enter custom input");
  console.log("3. Exit");
  
  rl.question("\nEnter your choice (1-3): ", (answer) => {
    switch(answer.trim()) {
      case "1":
        showTestCaseMenu();
        break;
      case "2":
        enterCustomInput();
        break;
      case "3":
        console.log("\nThank you for using Meeting Room Calculator!");
        rl.close();
        break;
      default:
        console.log("\nInvalid choice. Please try again.");
        showMainMenu();
    }
  });
}

// Show test case menu
function showTestCaseMenu() {
  console.log("\nSelect a test case:");
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
  });
  
  rl.question(`\nEnter your choice (1-${testCases.length}): `, (answer) => {
    const choice = parseInt(answer.trim());
    
    if (choice >= 1 && choice <= testCases.length) {
      const selectedTestCase = testCases[choice - 1];
      processEvents(selectedTestCase.events);
    } else {
      console.log("\nInvalid choice. Please try again.");
      showTestCaseMenu();
    }
  });
}

// Enter custom input
function enterCustomInput() {
  console.log("\nEnter your events in the format:");
  console.log("[{start: X, end: Y}, {start: Z, end: W}, ...]");
  console.log("Example: [{start: 0, end: 30}, {start: 5, end: 10}]");
  
  rl.question("\nYour input: ", (answer) => {
    try {
      // Replace single quotes with double quotes for JSON parsing
      const jsonStr = answer.replace(/'/g, '"');
      
      // Try to parse the input
      let events;
      try {
        events = JSON.parse(jsonStr);
      } catch (e) {
        // If direct parsing fails, try evaluating as JavaScript
        // This is safer than using eval() directly
        const safeEval = new Function('return ' + answer);
        events = safeEval();
      }
      
      // Validate the events
      if (!Array.isArray(events)) {
        throw new Error("Input must be an array of events");
      }
      
      for (const event of events) {
        if (typeof event.start !== 'number' || typeof event.end !== 'number') {
          throw new Error("Each event must have numeric start and end properties");
        }
        
        if (event.start >= event.end) {
          throw new Error("Event start time must be before end time");
        }
      }
      
      processEvents(events);
    } catch (error) {
      console.log(`\nError: ${error.message}`);
      console.log("Please try again with valid input.");
      enterCustomInput();
    }
  });
}

// Process events and show results
function processEvents(events) {
  console.clear();
  console.log("🏢 Meeting Room Calculator - Results 🏢");
  console.log("======================================\n");
  
  console.log("Input:");
  console.log(JSON.stringify(events, null, 2));
  console.log("");
  
  // Calculate minimum rooms
  const minRooms = minMeetingRooms(events);
  
  console.log(`Result: ${minRooms} room${minRooms !== 1 ? 's' : ''} needed\n`);
  
  // Generate explanation
  const explanation = generateExplanation(events);
  console.log("Explanation:");
  console.log(explanation);
  
  // Room assignments (stretch goal)
  const { assignments } = assignRooms(events);
  
  console.log("\nRoom Assignments:");
  assignments.forEach((assignment, index) => {
    console.log(`Event ${index} (${events[index].start}-${events[index].end}): Room ${assignment.roomId}`);
  });
  
  // Return to main menu
  rl.question("\nPress Enter to return to main menu...", () => {
    console.clear();
    showMainMenu();
  });
}

// Start the application
showMainMenu();