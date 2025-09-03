// Application Template Entry Point
// Replace this with your actual application code

import http from 'http';

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Invoice Ninja Application</h1>
      <p>Application template for Invoice Ninja service.</p>
      <p>Health check: <a href="/health">/health</a></p>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, () => {
  console.log(`Invoice Ninja application server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});