import Fastify from 'fastify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFunc } from './core/store.js';
import { invoke } from './core/processManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUNCTIONS_DIR = join(__dirname, 'functions');

const server = Fastify({
  logger: true,
});

// Health
server.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Deploy a function
server.post('/api/v1/functions', (req, res) => {
  const { name, code } = req.body;
  const id = createFunc(name, code);
  res.send({ id, url: `/fn/${name}` });
});

// Invoke a function (GET + POST)
const invokeHandler = async (req, res) => {
  const { name } = req.params;
  const fnPath = join(FUNCTIONS_DIR, `${name}.cjs`);
  const fnReq = {
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body || {},
  };

  try {
    const result = await invoke(fnPath, fnReq);
    res.send(result);
  } catch (err) {
    const status = err.message.includes('timed out') ? 408 : 500;
    res.code(status).send({ error: err.message });
  }
};

server.get('/fn/:name', invokeHandler);
server.post('/fn/:name', invokeHandler);

// Start
server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server is running on ${address}`);
});