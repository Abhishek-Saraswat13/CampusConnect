const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Body parsing
app.use(express.json({ limit: '1mb' }));

// CORS - only allow the configured frontend origin(s)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CampusConnect API is running' });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
