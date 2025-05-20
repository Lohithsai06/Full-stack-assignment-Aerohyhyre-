
# Full Stack Assignment

A multi-language, full-stack assignment covering frontend UI, REST API backend, algorithmic thinking, data processing, and systems-level C++ logic.

---

## 🖥️ Set 1: React Frontend - Dynamic UI

### Objective
Build an interactive "Task Manager" dashboard using Vite + React.

### Features
- Fetch task list from mock REST API
- Display task title, deadline, priority
- Highlight overdue tasks
- Filter by priority
- Sort by urgency score (deadline ÷ priority weight)

### How to Run

```bash
cd client
npm install
npm run dev
# Visit: http://localhost:5173
```

### Testing
- Use Jest + React Testing Library for unit testing
- Focus on filter and sorting logic

### Constraints
- Functional components + Hooks
- No external UI libraries
- Use plain CSS or CSS-in-JS

### Stretch Goals
- Debounced filter input
- React Transition Group animations
- Pagination or infinite scroll

---

## 🌐 Set 2: Backend API - Node & Express

### Objective
RESTful API for booking conference rooms.

### Features
- POST /bookings — Create booking
- GET /slots?date=YYYY-MM-DD — List available slots
- PUT /bookings/:id — Reschedule
- DELETE /bookings/:id — Cancel booking

### How to Run

```bash
cd server
npm install
node index.js
# API runs on: http://localhost:3000
```

### Testing
- Use Mocha/Chai or Jest for unit tests
- Validate booking conflict detection

### Constraints
- Only Express and native Node.js
- In-memory storage (e.g., JS Map)

### Stretch Goals
- Rate-limit bookings
- Atomic swap of bookings
- In-memory event logging

---

## 🧠 Set 3: JavaScript Algorithms

### Objective
Solve scheduling and sorting logic with JS.

### Features
- Bubble Sort
- Binary Search
- Recursion examples

### Bonus Task
Implement `minMeetingRooms(events)`:
- Calculate minimum rooms required for overlapping events
- Optimize for `O(n log n)` time, `O(n)` space

### How to Run

```bash
cd algorithms
node bubbleSort.js
node binarySearch.js
```

### Constraints
- No external libraries
- Clear and efficient logic

### Stretch Goals
- Assign events to specific room IDs
- Stream input via generator

---

## 🐍 Set 4: Python CSV Data Processing

### Objective
Analyze user activity from a CSV file using native Python only.

### Features
- Web UI for file upload (Flask)
- Top 5 users by activity
- Detect users repeating the same action >10 times in a 5-min window
- Results in Bootstrap dashboard

### How to Run

```bash
cd scripts/web_app
python app.py
# Visit: http://localhost:5000
```

### Input Format

```csv
timestamp,user_id,action
2024-05-01T10:00:00Z,1,login
...
```

### Constraints
- Standard libraries only (`csv`, `datetime`)
- Must handle timezones and sorting

### Stretch Goals
- Export to JSON
- Chunked file processing
- Robust error handling

---

## 🧮 Set 5: Sparse Matrix in C++

### Objective
Efficient sparse matrix implementation without STL.

### Features
- `set(row, col, value)`
- `get(row, col)`
- `nonZeroCount()` to track active entries

### How to Compile & Run

```bash
cd cpp
g++ -std=c++11 -o matrix sparse_matrix.cpp
./matrix
```

> 💡 Use VS Code with C++ extension on Windows, or test on [OnlineGDB](https://www.onlinegdb.com/).

### Constraints
- No STL maps or vectors
- Manual memory handling
- Use RAII principles

### Stretch Goals
- Add iterator over non-zero entries
- Implement `transpose()` method

---

## 📌 Suggested Time Allocation

| Set | Topic                    | Suggested Time |
|-----|--------------------------|----------------|
| 1   | ReactJS Dashboard        | 4–6 hours      |
| 2   | Node.js Booking API      | 4–5 hours      |
| 3   | JavaScript Algorithms    | 2–3 hours      |
| 4   | Python Data Processing   | 3–4 hours      |
| 5   | C++ Sparse Matrix        | 4 hours        |

---

## 🧪 Evaluation Criteria (General)

| Area               | Excellent                    | Good                           | Needs Improvement          |
|--------------------|------------------------------|--------------------------------|-----------------------------|
| Component Design   | Reusable, modular hooks      | Logical structure              | Monolithic, tightly coupled |
| State Management   | Context/useReducer used well | Mostly useState                | Props drilling problems     |
| Algorithm Logic    | Efficient, correct, scalable | Basic logic                    | Inefficient or incorrect    |
| Testing            | >90% coverage                | 70–90%                         | Missing or low coverage     |
| Code Quality       | Clean, documented, DRY       | Minor issues                   | Poor structure or clarity   |

---

## 📁 Project Structure

```
full-stack-assignment/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── algorithms/      # JavaScript sorting/search logic
├── scripts/         # Python CSV processor (Flask UI)
└── cpp/             # C++ Sparse Matrix implementation
```
