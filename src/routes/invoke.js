import { join } from 'path';
import { invoke } from '../core/processManager.js';

export default async function invokeRoutes(server) {
  const FUNCTIONS_DIR = join(import.meta.dirname, '..', 'functions');

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
}
