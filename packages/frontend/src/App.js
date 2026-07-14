import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import './App.css';

const defaultFormState = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
};

const toDateInput = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

const isOverdue = (task) => {
  if (!task.due_date || task.completed) {
    return false;
  }

  const dueDate = new Date(task.due_date);
  const now = new Date();
  dueDate.setHours(23, 59, 59, 999);
  return dueDate < now;
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('createdAt');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const formError = useMemo(() => {
    if (!formState.title.trim()) {
      return 'Task title is required';
    }

    return '';
  }, [formState.title]);

  useEffect(() => {
    fetchData();
  }, [filter, sort, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ filter, sort, search });
      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingTaskId(null);
  };

  const openNotification = (message) => {
    setNotification(message);
    setShowNotification(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formError) {
      setError(formError);
      return;
    }

    try {
      const isEditing = Boolean(editingTaskId);
      const response = await fetch(isEditing ? `/api/tasks/${editingTaskId}` : '/api/tasks', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description || null,
          dueDate: formState.dueDate || null,
          priority: formState.priority,
          completed: isEditing ? tasks.find((task) => task.id === editingTaskId)?.completed || false : false,
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update task' : 'Failed to add task');
      }

      const result = await response.json();
      if (isEditing) {
        setTasks(tasks.map((task) => (task.id === editingTaskId ? result : task)));
        openNotification('Task updated');
      } else {
        setTasks([result, ...tasks]);
        openNotification('Task added');
      }
      resetForm();
      setError(null);
    } catch (err) {
      setError('Error saving task: ' + err.message);
      console.error('Error saving task:', err);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      openNotification(updatedTask.completed ? 'Task marked completed' : 'Task marked active');
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setFormState({
      title: task.title,
      description: task.description || '',
      dueDate: toDateInput(task.due_date),
      priority: task.priority,
    });
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      if (editingTaskId === taskId) {
        resetForm();
      }
      openNotification('Task deleted');
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  return (
    <Box className="app-shell">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            TODO Planner
          </Typography>
          <Typography variant="body2">Stay focused and finish strong</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(300px, 34%) 1fr' },
            gap: 3,
          }}
        >
          <Box>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" component="h2" gutterBottom>
                {editingTaskId ? 'Edit task' : 'Add task'}
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="Task title"
                    value={formState.title}
                    onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                    required
                    error={Boolean(formError && error)}
                    helperText={formError && error ? formError : 'Required'}
                  />
                  <TextField
                    label="Description"
                    value={formState.description}
                    onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                    multiline
                    minRows={3}
                  />
                  <TextField
                    label="Due date"
                    type="date"
                    value={formState.dueDate}
                    onChange={(event) => setFormState({ ...formState, dueDate: event.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      label="Priority"
                      value={formState.priority}
                      onChange={(event) => setFormState({ ...formState, priority: event.target.value })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" type="submit">
                      {editingTaskId ? 'Save Task' : 'Add Task'}
                    </Button>
                    {editingTaskId && (
                      <Button variant="outlined" onClick={resetForm} type="button">
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                <FormControl fullWidth>
                  <InputLabel id="filter-label">View</InputLabel>
                  <Select
                    labelId="filter-label"
                    value={filter}
                    label="View"
                    onChange={(event) => setFilter(event.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="sort-label">Sort</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sort}
                    label="Sort"
                    onChange={(event) => setSort(event.target.value)}
                  >
                    <MenuItem value="createdAt">Created</MenuItem>
                    <MenuItem value="dueDate">Due date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Search"
                  placeholder="Search title or description"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Stack>

              {loading && <Typography>Loading tasks...</Typography>}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {!loading && tasks.length === 0 && <Typography>No tasks found. Add one to get started.</Typography>}

              {!loading && tasks.length > 0 && (
                <List>
                  {tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      divider
                      alignItems="flex-start"
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleEdit(task)}
                            aria-label={`Edit ${task.title}`}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(task.id)}
                            aria-label={`Delete ${task.title}`}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <IconButton
                          onClick={() => handleToggle(task.id)}
                          aria-label={task.completed ? `Mark ${task.title} active` : `Mark ${task.title} completed`}
                          color={task.completed ? 'success' : 'default'}
                        >
                          {task.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        </IconButton>
                        <ListItemText
                          secondaryTypographyProps={{ component: 'div' }}
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                opacity: task.completed ? 0.65 : 1,
                              }}
                            >
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mt={0.5}>
                              {task.description && (
                                <Typography component="span" variant="body2">
                                  {task.description}
                                </Typography>
                              )}
                              <Chip
                                size="small"
                                color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                                label={`Priority: ${task.priority}`}
                              />
                              {task.due_date && (
                                <Chip
                                  size="small"
                                  variant={isOverdue(task) ? 'filled' : 'outlined'}
                                  color={isOverdue(task) ? 'error' : 'default'}
                                  label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                                />
                              )}
                              {isOverdue(task) && <Chip size="small" color="error" label="Overdue" />}
                            </Stack>
                          }
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={showNotification}
        autoHideDuration={1800}
        onClose={() => setShowNotification(false)}
        message={notification}
      />
    </Box>
  );
}

export default App;