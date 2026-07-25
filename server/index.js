import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// CORS configuration - allow frontend origins
app.use(cors({
  origin: true, // reflects the request's own origin — safe since frontend & API are same-origin
  credentials: true,
}));

app.use(express.json());

// Serve frontend static files (must come before API routes and catch-all)
const frontendDistPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDistPath, {
  index: false // Don't automatically serve index.html, let the fallback handle it
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message ||(typeof message !== 'string')) {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build messages array with history
    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    // Stream response from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    
    // Convert messages to Gemini format
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const chat = model.startChat({ history: chatHistory.slice(0, -1) });
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    // Only send error if response hasn't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process request',
        details: error.message 
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// SPA fallback - serve index.html for client-side routes only
// This only triggers when:
// 1. Not an API route
// 2. Not a static file request (has no file extension)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Skip requests with file extensions (let express.static handle these)
  if (req.path.includes('.')) {
    return next();
  }
  
  // Serve index.html for client-side routing
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`VibeMatch LLM proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
});
