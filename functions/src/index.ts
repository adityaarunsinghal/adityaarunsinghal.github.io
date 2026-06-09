import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { defineString } from 'firebase-functions/params';

admin.initializeApp();

const ALLOWED_EMAILS = [
  'adityaarunsinghal@gmail.com',
  'johannefriedman@gmail.com',
  'johanne.friedman@gmail.com'
];

// Define API key as environment parameter
const translateApiKey = defineString('TRANSLATE_API_KEY');

// Cap the text we forward to the paid Translation API. Without a bound, a single
// authenticated user could submit megabytes per request and inflate billing.
const MAX_TEXT_LENGTH = 5000;

// Rate limiter: Map<uid, timestamp[]>
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

// maxInstances bounds the worst-case concurrent billing/runtime for this single
// personal-use endpoint; it is a hard ceiling against runaway scale or abuse.
export const translateText = functions.https.onRequest({ maxInstances: 5 }, async (req, res) => {
  const startTime = Date.now();
  console.log('Translation request received', { method: req.method, origin: req.headers.origin });

  // CORS headers - allow production and localhost
  const origin = req.headers.origin || '';
  const allowedOrigins = ['https://adityasinghal.com', 'http://localhost:5173', 'http://localhost:5174'];
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request handled');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    console.warn('Invalid method', { method: req.method });
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('Missing or invalid authorization header');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Log the opaque uid only, not the email (PII). uid is enough to correlate
    // requests and rate-limit buckets in logs.
    console.log('Auth token verified', { uid: decodedToken.uid });

    if (!ALLOWED_EMAILS.includes(decodedToken.email || '')) {
      console.warn('Forbidden access attempt', { uid: decodedToken.uid });
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Rate limiting
    const uid = decodedToken.uid;
    const now = Date.now();
    const userRequests = rateLimiter.get(uid) || [];
    const recentRequests = userRequests.filter(t => now - t < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_MAX) {
      console.warn('Rate limit exceeded', { uid, email: decodedToken.email, requests: recentRequests.length });
      res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
      return;
    }
    
    recentRequests.push(now);
    rateLimiter.set(uid, recentRequests);
    
    // Cleanup old entries every 100 requests
    if (rateLimiter.size > 100) {
      for (const [key, timestamps] of rateLimiter.entries()) {
        const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
        if (recent.length === 0) {
          rateLimiter.delete(key);
        } else {
          rateLimiter.set(key, recent);
        }
      }
    }

    // Get text to translate
    const { text, sourceLanguage } = req.body;
    if (typeof text !== 'string' || text.length === 0) {
      console.warn('Missing or invalid text parameter');
      res.status(400).json({ error: 'Missing or invalid text parameter' });
      return;
    }
    if (text.length > MAX_TEXT_LENGTH) {
      console.warn('Text too long', { length: text.length });
      res.status(413).json({ error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` });
      return;
    }

    // Log metadata only, not the text itself (the messages being translated are
    // private content).
    console.log('Translation request', { textLength: text.length, sourceLanguage });

    // Get API key from environment parameter
    const apiKey = translateApiKey.value();
    if (!apiKey) {
      console.error('Translation API key not configured');
      res.status(500).json({ error: 'Translation API not configured' });
      return;
    }

    // Call Google Translate API
    const translateStart = Date.now();
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage || 'da',
          target: 'en',
          format: 'text'
        })
      }
    );

    const data = await response.json();
    const translateDuration = Date.now() - translateStart;
    
    if (!response.ok) {
      console.error('Google Translate API error', { 
        status: response.status, 
        error: data,
        duration: translateDuration 
      });
      res.status(response.status).json({ error: data });
      return;
    }

    // Guard the response shape. A 200 with an unexpected body would otherwise
    // throw on data.data.translations[0] and surface as an opaque 500.
    const translatedText = (data as {
      data?: { translations?: Array<{ translatedText?: string }> };
    })?.data?.translations?.[0]?.translatedText;
    if (typeof translatedText !== 'string') {
      console.error('Unexpected Translate API response shape', { data });
      res.status(502).json({ error: 'Unexpected translation response' });
      return;
    }
    const totalDuration = Date.now() - startTime;

    console.log('Translation successful', {
      translateDuration,
      totalDuration,
      resultLength: translatedText.length
    });

    res.json({ translatedText });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Translation error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: totalDuration
    });
    res.status(500).json({ error: 'Translation failed' });
  }
});
