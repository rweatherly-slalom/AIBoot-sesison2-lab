const { createApp, DEFAULT_DB_PATH } = require('./app');

const PORT = process.env.PORT || 3030;
const DB_PATH = process.env.DB_PATH || DEFAULT_DB_PATH;
const { app } = createApp({ dbPath: DB_PATH });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/tasks`);
});