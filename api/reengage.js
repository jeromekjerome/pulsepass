// Copyright (c) 2026 Jerome W. Dewald. All rights reserved.
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateMessage(c) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 150,
    messages: [
      { role: 'system', content: `You are a friendly juice bar owner writing a short, personal SMS-length re-engagement message to a loyal customer who hasn't visited recently. Sound genuine and warm — no corporate language. Under 160 characters ideally.` },
      { role: 'user', content: `Customer name: ${c.name}
Favorite order: ${c.favoriteItem || 'our smoothies'}
Days since last visit: ${c.daysSince}
Total past visits: ${c.visitCount}

Write the re-engagement message.` }
    ]
  });
  return { customerId: c.id, customerName: c.name, message: completion.choices[0].message.content };
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
