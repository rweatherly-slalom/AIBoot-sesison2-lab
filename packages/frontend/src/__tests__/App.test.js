import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Write tests',
          due_date: '2030-01-10T00:00:00.000Z',
          priority: 'high',
          completed: false,
          created_at: '2030-01-01T00:00:00.000Z',
          updated_at: '2030-01-01T00:00:00.000Z',
        },
      ])
    );
  }),

  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    const { title } = body;
    
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Task title is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 2,
        title,
        description: body.description || null,
        due_date: body.dueDate || null,
        priority: body.priority || 'medium',
        completed: false,
        created_at: '2030-01-02T00:00:00.000Z',
        updated_at: '2030-01-02T00:00:00.000Z',
      })
    );
  }),

  rest.patch('/api/tasks/:id/toggle', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        title: 'Test Task 1',
        description: 'Write tests',
        due_date: '2030-01-10T00:00:00.000Z',
        priority: 'high',
        completed: true,
        created_at: '2030-01-01T00:00:00.000Z',
        updated_at: '2030-01-02T00:00:00.000Z',
      })
    );
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: 1 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('TODO Planner')).toBeInTheDocument();
    expect(screen.getByText('Stay focused and finish strong')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Priority: high')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
    
    const input = screen.getByRole('textbox', { name: /Task title/i });
    await act(async () => {
      await user.type(input, 'New Test Task');
    });
    
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    await act(async () => {
      await user.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add one to get started.')).toBeInTheDocument();
    });
  });

  test('toggles a task to completed', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getByLabelText('Mark Test Task 1 completed');
    await act(async () => {
      await user.click(toggleButton);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Mark Test Task 1 active')).toBeInTheDocument();
    });
  });
});