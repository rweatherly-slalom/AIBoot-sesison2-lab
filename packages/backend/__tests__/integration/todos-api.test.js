const request = require('supertest');
const { createApp } = require('../../src/app');

describe('TODO API integration flow', () => {
  let app;
  let db;

  beforeEach(() => {
    const setup = createApp({ dbPath: ':memory:' });
    app = setup.app;
    db = setup.db;
  });

  afterEach(() => {
    db.close();
  });

  it('supports create, search, and sort by due date', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Task A', dueDate: '2030-01-02', priority: 'medium' })
      .expect(201);

    await request(app)
      .post('/api/tasks')
      .send({ title: 'Task B', dueDate: '2030-01-01', priority: 'high' })
      .expect(201);

    const searched = await request(app).get('/api/tasks?search=task').expect(200);
    expect(searched.body).toHaveLength(2);

    const sorted = await request(app).get('/api/tasks?sort=dueDate').expect(200);
    expect(sorted.body[0].title).toBe('Task B');
    expect(sorted.body[1].title).toBe('Task A');
  });
});
