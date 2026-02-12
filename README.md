# PaSS

Platform as a Simple Service — a minimal serverless function platform.

Deploy JavaScript functions via API and invoke them on-demand in isolated child processes.

## Quick Start

```bash
npm install
node src/core/store-init.js   # initialize the database
npm start                      # starts on port 3000
```

## API

### Deploy a function

```bash
curl -X POST http://localhost:3000/api/v1/functions \
  -H "Content-Type: application/json" \
  -d '{"name": "hello", "code": "module.exports = async (req) => ({ message: \"hello\" })"}'
```

### Invoke a function

```bash
curl http://localhost:3000/fn/hello
```

Functions receive a request object with `method`, `headers`, `query`, and `body`.

See [openapi.yaml](openapi.yaml) for the full API spec.
