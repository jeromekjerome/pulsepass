// Copyright (c) 2026 Jerome W. Dewald. All rights reserved.
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateMessage(c) {
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
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { customers } = req.body;
  if (!customers?.length) return res.status(400).json({ error: 'customers array required' });

  const BATCH = 5;
  const results = [];

  for (let i = 0; i < customers.length; i += BATCH) {
    const batch = customers.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map(generateMessage));
    for (const r of settled) {
      if (r.status === 'fulfilled') results.push(r.value);
      else results.push({ customerId: null, customerName: '?', message: 'Failed to generate' });
    }
  }

  res.json({ messages: results });
}
