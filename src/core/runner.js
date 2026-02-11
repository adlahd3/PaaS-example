import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const fnPath = process.env.FUNCTION_PATH;
if (!fnPath) {
  process.send({ ok: false, error: 'No FUNCTION_PATH provided' });
  process.exit(1);
}

let fn;
try {
  fn = require(resolve(fnPath));
} catch (err) {
  process.send({ ok: false, error: `Failed to load function: ${err.message}` });
  process.exit(1);
}

if (typeof fn !== 'function') {
  process.send({ ok: false, error: 'module.exports must be a function' });
  process.exit(1);
}

process.on('message', async (req) => {
  try {
    const result = await fn(req);
    process.send({ ok: true, body: result });
  } catch (err) {
    process.send({ ok: false, error: err.message });
  }
});

process.send({ ready: true });