import { createFunc } from '../core/store.js';

export default async function functionsRoutes(server) {
  server.post('/api/v1/functions', (req, res) => {
    const { name, code } = req.body;
    const id = createFunc(name, code);
    res.send({ id, url: `/fn/${name}` });
  });
}
