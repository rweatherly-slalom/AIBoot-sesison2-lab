class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByRole('textbox', { name: /Task title/i });
    this.descriptionInput = page.getByRole('textbox', { name: /Description/i });
    this.dueDateInput = page.getByLabel('Due date');
    this.prioritySelect = page.getByLabel('Priority');
    this.addButton = page.getByRole('button', { name: 'Add Task' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.viewSelect = page.getByLabel('View');
    this.sortSelect = page.getByLabel('Sort');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByText('TODO Planner').waitFor();
  }

  async resetTasks() {
    const response = await this.page.request.get('/api/tasks');
    const tasks = await response.json();
    await Promise.all(tasks.map((task) => this.page.request.delete(`/api/tasks/${task.id}`)));
    await this.page.reload();
  }

  async createTask({ title, description = '', dueDate = '', priority = 'medium' }) {
    await this.titleInput.fill(title);

    if (description) {
      await this.descriptionInput.fill(description);
    }

    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }

    await this.prioritySelect.click();
    await this.page.getByRole('option', { name: new RegExp(`^${priority}$`, 'i') }).click();

    await this.addButton.click();
  }

  async openTaskEditor(title) {
    await this.page.getByLabel(`Edit ${title}`).click();
  }

  async saveEditedTask() {
    await this.page.getByRole('button', { name: 'Save Task' }).click();
  }

  taskTitle(title) {
    return this.page.getByText(title, { exact: true });
  }

  async toggleTask(title) {
    await this.page.getByLabel(`Mark ${title} completed`).click();
  }

  async deleteTask(title) {
    await this.page.getByLabel(`Delete ${title}`).click();
  }

  async filterBy(viewName) {
    await this.viewSelect.click();
    await this.page.getByRole('option', { name: viewName }).click();
  }

  async searchFor(query) {
    await this.searchInput.fill(query);
  }

  async sortBy(sortName) {
    await this.sortSelect.click();
    await this.page.getByRole('option', { name: sortName }).click();
  }
}

module.exports = { TodoPage };
