import { Player, ApiResponse } from '../types';
import CryptoJS from 'crypto-js';

const API_URL = 'https://wos-giftcode-api.centurygame.com/api/player';
// Fallback salt for client-side direct calls (mostly for local dev/preview)
const SALT = (import.meta as any).env?.VITE_API_SALT || 'tB87#kPtkxqOS2';

/**
 * Fetches player data.
 * Strategy:
 * 1. Try local /api/player proxy (Vercel Serverless Function).
 *    - Pros: Secure (hides salt), avoids CORS.
 *    - Cons: Requires 'vercel dev' locally, adds latency.
 * 2. Fallback to direct API call.
 *    - Pros: Works in standard 'vite' local dev.
 *    - Cons: Exposes salt, relies on API CORS policy.
 */
export const fetchPlayer = async (fid: string): Promise<Player> => {
  try {
    // 1. Attempt Proxy
    // We wrap this in a try-block so network errors or 404s trigger fallback
    try {
      const proxyResponse = await fetch(`/api/player?fid=${encodeURIComponent(fid)}`);
      const contentType = proxyResponse.headers.get("content-type");
      
      // Only process if we got a success JSON response
      if (proxyResponse.ok && contentType && contentType.includes("application/json")) {
        const result: ApiResponse<Player> = await proxyResponse.json();
        if (result.code !== 0) {
          throw new Error(result.msg || 'Unknown API error from proxy');
        }
        return result.data;
      }
      
      // If we get here, proxy didn't return valid JSON (e.g. 404 HTML page in Vite dev)
      // or returned an error status. We fall through to direct call.
      console.warn("Proxy endpoint unavailable or invalid, switching to direct call.");
    } catch (proxyError) {
      console.warn("Proxy attempt failed:", proxyError);
    }

    // 2. Fallback: Direct Client-Side Call
    console.log("Using direct API connection...");
    
    const time = Date.now().toString();
    const signString = `fid=${fid}&time=${time}${SALT}`;
    const sign = CryptoJS.MD5(signString).toString();

    const params = new URLSearchParams();
    params.append('fid', fid);
    params.append('time', time);
    params.append('sign', sign);

    const directResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!directResponse.ok) {
        throw new Error(`Direct API Error: ${directResponse.status} ${directResponse.statusText}`);
    }

    const result: ApiResponse<Player> = await directResponse.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || 'Unknown API error');
    }

    return result.data;

  } catch (error) {
    console.error("Fetch player error:", error);
    throw error;
  }
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));