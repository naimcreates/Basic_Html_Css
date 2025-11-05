/*
 * A simple Node.js backend for the Best Notepad app.
 *
 * This server uses only built‑in Node modules (no external dependencies)
 * to provide a REST API for managing notes. Data is stored in a JSON file
 * (`notes.json`) alongside this script. CORS headers are added to allow
 * the browser frontend to communicate with the API from another port.
 */

import http from 'http';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Determine file paths relative to this script
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'notes.json');

// Helper to read all notes from disk, falling back to an empty array
async function readNotes() {
  try {
    const text = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(text);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Helper to write notes to disk
async function writeNotes(notes) {
  const text = JSON.stringify(notes, null, 2);
  await fs.writeFile(DATA_FILE, text, 'utf8');
}

// Generate a unique ID based on timestamp and random number
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Parse JSON body
async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        const obj = JSON.parse(data);
        resolve(obj);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

// Main request handler
async function requestHandler(req, res) {
  // Enable CORS for any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Respond to preflight requests early
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  // Route: /api/notes
  if (pathname === '/api/notes' && req.method === 'GET') {
    const notes = await readNotes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(notes));
    return;
  }
  // Route: GET /api/notes/:id
  if (pathname.startsWith('/api/notes/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const notes = await readNotes();
    const note = notes.find(n => n.id === id);
    if (!note) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Note not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(note));
    return;
  }
  // Route: POST /api/notes
  if (pathname === '/api/notes' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const content = body.content;
      const title = typeof body.title === 'string' ? body.title : '';
      if (!content || typeof content !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'content is required' }));
        return;
      }
      const notes = await readNotes();
      const newNote = {
        id: generateId(),
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      notes.push(newNote);
      await writeNotes(notes);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newNote));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  // Route: PUT /api/notes/:id
  if (pathname.startsWith('/api/notes/') && req.method === 'PUT') {
    const id = pathname.split('/').pop();
    try {
      const body = await parseRequestBody(req);
      const notes = await readNotes();
      const noteIndex = notes.findIndex(n => n.id === id);
      if (noteIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Note not found' }));
        return;
      }
      const note = notes[noteIndex];
      // Update title and content if provided
      if (typeof body.title === 'string') note.title = body.title;
      if (typeof body.content === 'string') note.content = body.content;
      note.updated_at = new Date().toISOString();
      notes[noteIndex] = note;
      await writeNotes(notes);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(note));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  // Route: DELETE /api/notes/:id
  if (pathname.startsWith('/api/notes/') && req.method === 'DELETE') {
    const id = pathname.split('/').pop();
    const notes = await readNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Note not found' }));
      return;
    }
    notes.splice(index, 1);
    await writeNotes(notes);
    res.writeHead(204);
    res.end();
    return;
  }
  // Fallback: Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Determine port
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Create and start server
const server = http.createServer((req, res) => {
  requestHandler(req, res).catch(err => {
    console.error('Unexpected error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  });
});
server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
