const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO critical workflows', () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.resetTasks();
  });

  test('creates a task with due date and priority', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = `Create flow ${Date.now()}`;

    await todoPage.createTask({
      title,
      description: 'Use POM with one browser',
      dueDate: '2030-01-10',
      priority: 'High',
    });

    await expect(todoPage.taskTitle(title)).toBeVisible();
    await expect(page.getByText('Priority: high')).toBeVisible();
  });

  test('validates empty title before submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('alert')).toContainText('Task title is required');
  });

  test('edits an existing task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const oldTitle = `Edit flow ${Date.now()}`;
    const newTitle = `${oldTitle} updated`;

    await todoPage.createTask({ title: oldTitle, priority: 'Medium' });
    await todoPage.openTaskEditor(oldTitle);

    await todoPage.titleInput.fill(newTitle);
    await todoPage.saveEditedTask();

    await expect(todoPage.taskTitle(newTitle)).toBeVisible();
  });

  test('toggles completion and filters completed view', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = `Toggle flow ${Date.now()}`;

    await todoPage.createTask({ title, priority: 'Low' });
    await todoPage.toggleTask(title);
    await todoPage.filterBy('Completed');

    await expect(todoPage.taskTitle(title)).toBeVisible();
  });

  test('searches and deletes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = `Delete flow ${Date.now()}`;

    await todoPage.createTask({ title, description: 'Delete path check' });
    await todoPage.searchFor('Delete flow');

    await expect(todoPage.taskTitle(title)).toBeVisible();
    await todoPage.deleteTask(title);
    await expect(todoPage.taskTitle(title)).not.toBeVisible();
  });
});
