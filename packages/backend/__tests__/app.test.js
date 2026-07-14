const request = require('supertest');
const { createApp } = require('../src/app');

describe('Task API Endpoints', () => {
  let app;
  let db;

  beforeEach(() => {
    const result = createApp({ dbPath: ':memory:' });
    app = result.app;
    db = result.db;
  });

  afterEach(() => {
    db.close();
  });

  it('creates and returns a task', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'Finish bootcamp lab',
      description: 'Implement TODO backend and frontend',
      priority: 'high',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Finish bootcamp lab',
      description: 'Implement TODO backend and frontend',
      priority: 'high',
      completed: false,
    });
    expect(response.body).toHaveProperty('id');
  });

  it('rejects task creation when title is missing', async () => {
    const response = await request(app).post('/api/tasks').send({ priority: 'medium' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Task title is required' });
  });

  it('lists tasks using active and completed filters', async () => {
    const first = await request(app).post('/api/tasks').send({ title: 'Active task' });
    await request(app).post('/api/tasks').send({ title: 'Completed task' });

    await request(app).patch(`/api/tasks/${first.body.id}/toggle`).send();

    const active = await request(app).get('/api/tasks?filter=active');
    const completed = await request(app).get('/api/tasks?filter=completed');

    expect(active.status).toBe(200);
    expect(completed.status).toBe(200);
    expect(active.body).toHaveLength(1);
    expect(completed.body).toHaveLength(1);
    expect(active.body[0].title).toBe('Completed task');
    expect(completed.body[0].title).toBe('Active task');
  });

  it('updates a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Old title' });

    const response = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'New title', priority: 'low', completed: true });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('New title');
    expect(response.body.priority).toBe('low');
    expect(response.body.completed).toBe(true);
  });

  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Delete me' });

    const response = await request(app).delete(`/api/tasks/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Task deleted successfully', id: created.body.id });
  });
});