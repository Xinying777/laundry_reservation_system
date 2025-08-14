const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Laundry Backend is running!' });
});

// 调试端点 - 检查环境变量
app.get('/debug/env', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST || 'NOT_SET',
    DB_PORT: process.env.DB_PORT || 'NOT_SET',
    DB_NAME: process.env.DB_NAME || 'NOT_SET',
    DB_USER: process.env.DB_USER || 'NOT_SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  });
});

// 路由
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const reservationRoutes = require('./routes/reservations');
const lostAndFoundRoutes = require('./routes/lostandfound');

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/lostandfound', lostAndFoundRoutes);

// API信息端点
app.get('/api', (req, res) => {
  res.json({
    message: 'Laundry Reservation System API',
    version: '1.0.0',
    status: 'All routes active',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      machines: {
        getAllMachines: 'GET /api/machines',
        getMachine: 'GET /api/machines/:id',
        getAllAvailability: 'GET /api/machines/availability/all',
        getMachineAvailability: 'GET /api/machines/:id/availability'
      },
      reservations: {
        getAllReservations: 'GET /api/reservations',
        getUserReservations: 'GET /api/reservations/my',
        createReservation: 'POST /api/reservations',
        confirmReservation: 'POST /api/reservations/confirm',
        cancelReservation: 'DELETE /api/reservations/:id'
      },
      lostAndFound: {
        getAllItems: 'GET /api/lostandfound',
        getItem: 'GET /api/lostandfound/:id',
        reportItem: 'POST /api/lostandfound/report',
        updateStatus: 'PUT /api/lostandfound/:id/status',
        deleteItem: 'DELETE /api/lostandfound/:id'
      }
    }
  });
});

// Serve frontend static files if a production build exists in the backend `build` folder
// (This allows visiting /home and other client routes to return index.html)
const frontendBuildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // Fallback to index.html for client-side routes
  app.get('*', (req, res, next) => {
    // If request starts with /api, pass through to API routes
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health' || req.originalUrl.startsWith('/debug')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested_url: req.originalUrl
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;