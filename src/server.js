import Fastify from 'fastify';
import functionsRoutes from './routes/functions.js';
import invokeRoutes from './routes/invoke.js';

const server = Fastify({
  logger: true,
});

// Health
server.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Routes
server.register(functionsRoutes);
server.register(invokeRoutes);

// Start
server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server is running on ${address}`);
});