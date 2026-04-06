import assert from 'node:assert/strict';
import { startServer } from './helpers.mjs';
import { test } from './runner.mjs';

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY ||= 'test-openai-key';

const { default: app } = await import('../server.js');

test('nudge validates required customer payload', async () => {
  const server = await startServer(app);
  try {
    const response = await fetch(`${server.baseUrl}/api/nudge`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.deepEqual(body, { error: 'customer required' });
  } finally {
    await server.close();
  }
});

test('reengage validates required customers array', async () => {
  const server = await startServer(app);
  try {
    const response = await fetch(`${server.baseUrl}/api/reengage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ customers: [] }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.deepEqual(body, { error: 'customers array required' });
  } finally {
    await server.close();
  }
});

test('unknown route does not crash the server', async () => {
  const server = await startServer(app);
  try {
    const response = await fetch(`${server.baseUrl}/definitely-not-a-real-route`);
    assert.notEqual(response.status, 500);
  } finally {
    await server.close();
  }
});