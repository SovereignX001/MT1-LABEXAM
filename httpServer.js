import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;

// ES Modules don't have __dirname, so build it manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory task storage (no database)
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Verma', status: 'In Progress' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed' }
];

// Helper: send a JSON response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Helper: send an HTML response
const sendHTML = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { url, method } = req;

  // Route: /
  if (url === '/') {
    if (method !== 'GET') {
      return sendHTML(res, 405, '<h1>405 - Method Not Allowed</h1>');
    }
    return sendHTML(res, 200, '<h1>Welcome to Employee Task Management</h1>');
  }

  // Route: /tasks  (GET all tasks)
  if (url === '/tasks') {
    if (method !== 'GET') {
      return sendJSON(res, 405, { error: 'Method Not Allowed' });
    }
    return sendJSON(res, 200, tasks);
  }

  // Route: /about
  if (url === '/about') {
    if (method !== 'GET') {
      return sendHTML(res, 405, '<h1>405 - Method Not Allowed</h1>');
    }
    return sendHTML(
      res,
      200,
      '<h1>About</h1>' +
        '<p>Employee Task Management Application built using the Node.js HTTP module.</p>'
    );
  }

  // Route: /home  (static file served using the FS module)
  if (url === '/home') {
    if (method !== 'GET') {
      return sendHTML(res, 405, '<h1>405 - Method Not Allowed</h1>');
    }
    const filePath = path.join(__dirname, 'public', 'index.html');
    return fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('File read error:', err.message);
        return sendHTML(res, 500, '<h1>500 - Error reading file</h1>');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  // Route: /add-task  (POST a new task)
  if (url === '/add-task') {
    if (method !== 'POST') {
      return sendJSON(res, 405, { error: 'Method Not Allowed. Use POST.' });
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Parse JSON safely
      let newTask;
      try {
        newTask = JSON.parse(body);
      } catch (error) {
        return sendJSON(res, 400, { error: 'Invalid JSON format' });
      }

      // Validate required fields
      const { id, taskName, assignedTo, status } = newTask;
      if (
        id === undefined ||
        !taskName ||
        !assignedTo ||
        !status
      ) {
        return sendJSON(res, 400, {
          error: 'Missing required fields: id, taskName, assignedTo and status'
        });
      }

      // Reject duplicate ids
      if (tasks.some((task) => task.id === id)) {
        return sendJSON(res, 400, { error: `Task with id ${id} already exists` });
      }

      // Add only the required fields to the array
      const task = { id, taskName, assignedTo, status };
      tasks.push(task);

      return sendJSON(res, 201, { message: 'Task added successfully', task });
    });

    return;
  }

  // Anything else: 404
  return sendHTML(res, 404, '<h1>404 - Route Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});