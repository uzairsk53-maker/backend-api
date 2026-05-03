require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

require('./src/config/redis');
require('./src/workers/cron'); // initialize cron
const logger = require('./src/config/logger');
const swaggerSpec = require('./src/config/swagger');
const swaggerUi = require('swagger-ui-express');

// Emitter
const appEmitter = require('./src/utils/events');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Hook events to socket
appEmitter.on('orderCreated', order => io.emit('orderCreated', order));
appEmitter.on('orderStatusUpdated', order => io.emit(`orderStatusUpdated_${order.id}`, order));
appEmitter.on('deliveryAssigned', order => io.emit('deliveryAssigned', order));

// Security plugins
app.use(helmet());
app.use(cors());
app.use(express.json());

// DDoS Prevention
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150, 
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Global Request Logger via Morgan/Winston
const morgan = require('morgan');
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Shop Credit App Enterprise API v1' });
});

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API v1 Routing
app.use('/api/v1', require('./src/routes/index'));
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(require('path').join(process.cwd(), 'src', 'uploads')));

// Fallback error handler
const { errorResponse } = require('./src/utils/response');
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return errorResponse(res, 500, 'Internal Server Error', err.message);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Enterprise Server running on port ${PORT}`);
    console.log(`Enterprise API running at http://localhost:${PORT}/api/v1`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
