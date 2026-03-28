// Copyright (c) 2026 Jerome W. Dewald. All rights reserved.
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { customer } = req.body;
  if (!customer) return res.status(400).json({ error: 'customer required' });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { name, goals, visits = [] } = customer;
  const lastOrders = visits.slice(-3).map(v => v.item).filter(Boolean);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        { role: 'system', content: `You are a friendly wellness barista at a juice bar. Generate warm, personal, encouraging next-visit suggestions. Keep it to 2-3 sentences. Be specific to their goals and order history. Sound like a person who knows them, not a marketing bot.` },
        { role: 'user', content: `Customer: ${name}
Health goal: ${goals || 'general wellness'}
Recent orders: ${lastOrders.length > 0 ? lastOrders.join(', ') : 'first visit'}
Visits total: ${visits.length}

Write a personalized next-visit nudge for them.` }
      ]
    });

    res.json({ message: completion.choices[0].message.content });
  } catch (err) {
    console.error('Nudge error:', err);
    res.status(500).json({ error: err.message });
  }
}
