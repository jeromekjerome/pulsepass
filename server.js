// Copyright (c) 2026 Jerome W. Deyland. All rights reserved.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Generate a single next-visit nudge for one customer
app.post('/api/nudge', async (req, res) => {
  const { customer } = req.body;
  if (!customer) return res.status(400).json({ error: 'customer required' });

  const { name, goals, visits = [] } = customer;
  const lastOrders = visits.slice(-3).map(v => v.item).filter(Boolean);
  const favItem = lastOrders[0] || 'our blends';

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are a friendly wellness barista at a juice bar. Generate warm, personal, encouraging next-visit suggestions. Keep it to 2-3 sentences. Be specific to their goals and order history. Sound like a person who knows them, not a marketing bot.`,
      messages: [{
        role: 'user',
        content: `Customer: ${name}
Health goal: ${goals || 'general wellness'}
Recent orders: ${lastOrders.length > 0 ? lastOrders.join(', ') : 'first visit'}
Visits total: ${visits.length}

Write a personalized next-visit nudge for them.`
      }]
    });
    res.json({ message: response.content[0].text });
  } catch (err) {
    console.error('Nudge error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate re-engagement messages for multiple at-risk customers
app.post('/api/reengage', async (req, res) => {
  const { customers } = req.body;
  if (!customers?.length) return res.status(400).json({ error: 'customers array required' });

  const BATCH = 5;
  const results = [];

  for (let i = 0; i < customers.length; i += BATCH) {
    const batch = customers.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map(async (c) => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: `You are a friendly juice bar owner writing a short, personal SMS-length re-engagement message to a loyal customer who hasn't visited recently. Sound genuine and warm — no corporate language. Under 160 characters ideally.`,
        messages: [{
          role: 'user',
          content: `Customer name: ${c.name}
Favorite order: ${c.favoriteItem || 'our smoothies'}
Days since last visit: ${c.daysSince}
Total past visits: ${c.visitCount}

Write the re-engagement message.`
        }]
      });
      return { customerId: c.id, customerName: c.name, message: response.content[0].text };
    }));
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value);
      else results.push({ customerId: null, customerName: '?', message: 'Failed to generate', error: r.reason?.message });
    }
  }

  res.json({ messages: results });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => console.log(`PulsePass running on port ${PORT}`));
export default app;
