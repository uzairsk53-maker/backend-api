require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require("path");

require('./src/config/redis');
require('./src/workers/cron');
const logger = require('./src/config/logger');
const swaggerSpec = require('./src/config/swagger');
const swaggerUi = require('swagger-ui-express');

const appEmitter = require('./src/utils/events');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// 🔥 Socket Events
appEmitter.on('orderCreated', order => io.emit('orderCreated', order));
appEmitter.on('orderStatusUpdated', order => io.emit(`orderStatusUpdated_${order.id}`, order));
appEmitter.on('deliveryAssigned', order => io.emit('deliveryAssigned', order));

// 🔐 FIXED Helmet (important)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
app.use(express.json());

// ✅ ONLY ONE uploads static (correct path)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));
// 🚫 DDoS Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 📄 Logger
const morgan = require('morgan');
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// ❤️ Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Shop Credit App Enterprise API v1' });
});

// 📘 Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🚀 Routes
app.use('/api/v1', require('./src/routes/index'));

// ❌ Error Handler
const { errorResponse } = require('./src/utils/response');
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message}`);
  return errorResponse(res, 500, 'Internal Server Error', err.message);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});