export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { dbId, cursor } = req.body || {};
  if (!dbId) return res.status(400).json({ error: 'Missing dbId' });

  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN not configured' });

  const body = {
    filter: { property: 'Estado', status: { equals: 'Listo' } },
    page_size: 100
  };
  if (cursor) body.start_cursor = cursor;

  const notionRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await notionRes.json();
  if (!notionRes.ok) return res.status(notionRes.status).json(data);
  return res.status(200).json(data);
}
