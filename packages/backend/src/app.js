const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const PRIORITY_LEVELS = ['low', 'medium', 'high'];
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'todo.db');

const ensureDbDirectory = (dbPath) => {
  if (dbPath === ':memory:') {
    return;
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
};

const validateDueDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const toTaskDto = (task) => ({
  ...task,
  completed: task.completed === 1,
});

const createApp = ({ dbPath = DEFAULT_DB_PATH } = {}) => {
  ensureDbDirectory(dbPath);
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  app.get('/api/tasks', (req, res) => {
    try {
      const { filter = 'all', sort = 'createdAt', search = '' } = req.query;

      if (!['all', 'active', 'completed'].includes(filter)) {
        return res.status(400).json({ error: 'Invalid filter value' });
      }

      if (!['createdAt', 'dueDate', 'priority'].includes(sort)) {
        return res.status(400).json({ error: 'Invalid sort value' });
      }

      const where = [];
      const params = [];

      if (filter === 'active') {
        where.push('completed = 0');
      }

      if (filter === 'completed') {
        where.push('completed = 1');
      }

      if (search.trim()) {
        where.push("(LOWER(title) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?)");
        const searchParam = `%${search.toLowerCase()}%`;
        params.push(searchParam, searchParam);
      }

      let orderBy = 'created_at DESC';
      if (sort === 'dueDate') {
        orderBy = 'CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, created_at DESC';
      }

      if (sort === 'priority') {
        orderBy = `
          CASE priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            ELSE 3
          END,
          created_at DESC
        `;
      }

      const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const tasks = db.prepare(`SELECT * FROM tasks ${whereClause} ORDER BY ${orderBy}`).all(...params);

      res.json(tasks.map(toTaskDto));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { title, description = null, dueDate = null, priority = 'medium' } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
      }

      if (!PRIORITY_LEVELS.includes(priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      }

      const normalizedDueDate = validateDueDate(dueDate);
      if (dueDate && normalizedDueDate === null) {
        return res.status(400).json({ error: 'Due date must be a valid date' });
      }

      const now = new Date().toISOString();
      const result = db
        .prepare(
          'INSERT INTO tasks (title, description, due_date, priority, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(title.trim(), description, normalizedDueDate, priority, 0, now, now);

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(toTaskDto(task));
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updates = {
        title: req.body.title !== undefined ? req.body.title : existing.title,
        description: req.body.description !== undefined ? req.body.description : existing.description,
        dueDate: req.body.dueDate !== undefined ? req.body.dueDate : existing.due_date,
        priority: req.body.priority !== undefined ? req.body.priority : existing.priority,
        completed: req.body.completed !== undefined ? req.body.completed : existing.completed === 1,
      };

      if (!updates.title || typeof updates.title !== 'string' || updates.title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
      }

      if (!PRIORITY_LEVELS.includes(updates.priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      }

      if (typeof updates.completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
      }

      const normalizedDueDate = validateDueDate(updates.dueDate);
      if (updates.dueDate && normalizedDueDate === null) {
        return res.status(400).json({ error: 'Due date must be a valid date' });
      }

      const updatedAt = new Date().toISOString();
      db.prepare(
        'UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, completed = ?, updated_at = ? WHERE id = ?'
      ).run(
        updates.title.trim(),
        updates.description,
        normalizedDueDate,
        updates.priority,
        updates.completed ? 1 : 0,
        updatedAt,
        id
      );

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      res.json(toTaskDto(task));
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.patch('/api/tasks/:id/toggle', (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
      }

      db.prepare('UPDATE tasks SET completed = ?, updated_at = ? WHERE id = ?').run(
        existing.completed === 1 ? 0 : 1,
        new Date().toISOString(),
        id
      );

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      res.json(toTaskDto(task));
    } catch (error) {
      console.error('Error toggling task:', error);
      res.status(500).json({ error: 'Failed to toggle task' });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully', id });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  return { app, db };
};

module.exports = { createApp, DEFAULT_DB_PATH };