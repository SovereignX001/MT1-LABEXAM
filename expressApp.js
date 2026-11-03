import express from 'express';

const app = express();
const PORT = 4000;

// Parse JSON request bodies
app.use(express.json());

// In-memory task storage (no database)
let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Verma', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' }
];

// GET /tasks - retrieve all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id - retrieve a task by ID
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  res.status(200).json(task);
});

// POST /tasks - add a new task
app.post('/tasks', (req, res) => {
  const { id, taskName, assignedTo, status, priority } = req.body;

  // Validate required fields
  if (id === undefined || !taskName || !assignedTo || !status || !priority) {
    return res.status(400).json({
      error: 'Missing required fields: id, taskName, assignedTo, status and priority'
    });
  }

  if (typeof id !== 'number') {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  // Reject duplicate ids
  if (tasks.some((t) => t.id === id)) {
    return res.status(400).json({ error: `Task with id ${id} already exists` });
  }

  const newTask = { id, taskName, assignedTo, status, priority };
  tasks.push(newTask);

  res.status(201).json({ message: 'Task added successfully', task: newTask });
});

// PUT /tasks/:id - update task details
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  const { taskName, assignedTo, status, priority } = req.body;

  if (!taskName || !assignedTo || !status || !priority) {
    return res.status(400).json({
      error: 'Missing required fields: taskName, assignedTo, status and priority'
    });
  }

  // Update the record in the array (id stays the same)
  task.taskName = taskName;
  task.assignedTo = assignedTo;
  task.status = status;
  task.priority = priority;

  res.status(200).json({ message: 'Task updated successfully', task });
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Task id must be a number' });
  }

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  const deletedTask = tasks.splice(index, 1)[0];

  res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});