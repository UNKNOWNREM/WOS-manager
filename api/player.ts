import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This runs on the server (Vercel), protecting the Salt
const SALT = process.env.VITE_API_SALT || 'tB87#kPtkxqOS2';
const API_URL = 'https://wos-giftcode-api.centurygame.com/api/player';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests (or POST if you prefer)
  if (req.method !== 'GET') {
    return res.status(405).json({ code: -1, msg: 'Method Not Allowed' });
  }

  const { fid } = req.query;

  if (!fid || Array.isArray(fid)) {
    return res.status(400).json({ code: -1, msg: 'Missing or invalid fid' });
  }

  try {
    const time = Date.now().toString();
    const signString = `fid=${fid}&time=${time}${SALT}`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');

    const params = new URLSearchParams();
    params.append('fid', fid as string);
    params.append('time', time);
    params.append('sign', sign);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    
    // Set cache control for performance
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return res.status(500).json({ code: 500, msg: 'Internal Server Error' });
  }
}