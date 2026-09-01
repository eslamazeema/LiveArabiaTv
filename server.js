/**
 * Arabia Live TV (arabialivetv.com) - Node.js Express Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Arabia Live TV Portal (arabialivetv.com)',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`📺 Arabia Live TV Server running at: http://localhost:${PORT}`);
  console.log(`⚙️ Admin Dashboard available at: http://localhost:${PORT}/admin.html`);
  console.log(`====================================================`);
});
