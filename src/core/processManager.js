import { fork } from 'child_process';
import path from 'path';

const RUNNER_PATH = path.join(import.meta.dirname, 'runner.js');

const DEFAULTS = {
  timeout: 10_000,   // 10s
  maxMemory: 128,    // 128MB
};

/**
 * Invoke a user function in an isolated child process.
 *
 * @param {string} functionPath - absolute path to the .js file
 * @param {object} req - { method, headers, query, body }
 * @param {object} opts - { timeout, maxMemory }
 * @returns {Promise<any>} - the function's return value
 */
function invoke(functionPath, req, opts = {}) {
  const { timeout, maxMemory } = { ...DEFAULTS, ...opts };

  return new Promise((resolve, reject) => {
    const child = fork(RUNNER_PATH, [], {
      env: { FUNCTION_PATH: functionPath }, // clean env — no host leaks
      execArgv: [`--max-old-space-size=${maxMemory}`],
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      if (stderr.length < 10_000) stderr += chunk; // cap stderr capture
    });

    // Timeout guard
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Function timed out after ${timeout}ms`));
    }, timeout);

    const cleanup = () => {
      clearTimeout(timer);
      if (!child.killed) child.kill();
    };

    child.on('message', (msg) => {
      // Wait for ready signal before sending request
      if (msg.ready) {
        child.send(req);
        return;
      }

      cleanup();
      if (msg.ok) {
        resolve(msg.body);
      } else {
        reject(new Error(msg.error));
      }
    });

    child.on('error', (err) => {
      cleanup();
      reject(new Error(`Process error: ${err.message}`));
    });

    child.on('exit', (code) => {
      cleanup();
      if (code !== 0 && code !== null) {
        reject(new Error(`Process exited with code ${code}. ${stderr}`));
      }
    });
  });
}

export { invoke };