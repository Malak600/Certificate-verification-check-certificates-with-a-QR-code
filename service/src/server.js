import http from 'node:http';
import { processBatch } from './index.js';

// In-memory certificate store (hash -> certificate object)
export const certificateStore = new Map();

/**
 * Parses JSON body from request.
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e7) {
        // 10MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * CORS headers for cross-origin frontend requests (e.g. from web/issue.html).
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Creates the HTTP server instance.
 */
export function createServer() {
  return http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    try {
      // Health check endpoint
      if (req.method === 'GET' && pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', service: 'certichain-api' }));
      }

      // POST /api/issue: Processes attendance CSV and returns hashes + cert metadata
      if (req.method === 'POST' && pathname === '/api/issue') {
        const body = await readJsonBody(req);
        const { csv, event, issuer, options = {} } = body;

        if (!csv) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing CSV content in request body.' }));
        }

        const eventDetails = event || {
          title: body.title || 'University Workshop',
          date: body.date || new Date().toISOString().split('T')[0],
          hours: Number(body.hours) || 2,
        };

        const issuerDetails = issuer || {
          name: body.clubName || body.club || 'IKU Computer Club',
          clubName: body.clubName || body.club || 'IKU Computer Club',
          walletAddress: body.walletAddress || body.wallet || '0x0000000000000000000000000000000000000000',
        };

        const batchResult = await processBatch(csv, eventDetails, issuerDetails, options);

        // Save generated certificates in store for lookup
        batchResult.results.forEach(item => {
          certificateStore.set(item.hash.toLowerCase(), {
            certificate: item.certificate,
            verificationUrl: item.verificationUrl,
            pdfBase64: item.pdfBuffer.toString('base64'),
          });
        });

        const responsePayload = {
          success: batchResult.errors.length === 0,
          total: batchResult.results.length,
          hashes: batchResult.hashes,
          certificates: batchResult.certificates,
          errors: batchResult.errors,
          items: batchResult.results.map(r => ({
            name: r.participant.name,
            email: r.participant.email,
            hash: r.hash,
            verificationUrl: r.verificationUrl,
            pdfDownloadUrl: `/api/certificate/${r.hash}/pdf`,
          })),
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(responsePayload));
      }

      // GET /api/certificate/:hash: Retrieve certificate JSON by hash
      const certMatch = pathname.match(/^\/api\/certificate\/(0x[a-fA-F0-9]{64})$/);
      if (req.method === 'GET' && certMatch) {
        const hash = certMatch[1].toLowerCase();
        const stored = certificateStore.get(hash);

        if (!stored) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Certificate not found.' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(stored.certificate));
      }

      // GET /api/certificate/:hash/pdf: Download the stamped PDF by hash
      const pdfMatch = pathname.match(/^\/api\/certificate\/(0x[a-fA-F0-9]{64})\/pdf$/);
      if (req.method === 'GET' && pdfMatch) {
        const hash = pdfMatch[1].toLowerCase();
        const stored = certificateStore.get(hash);

        if (!stored) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Certificate PDF not found.' }));
        }

        const pdfBuffer = Buffer.from(stored.pdfBase64, 'base64');
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="certificate-${hash.slice(0, 10)}.pdf"`,
          'Content-Length': pdfBuffer.length,
        });
        return res.end(pdfBuffer);
      }

      // 404 for unknown routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Route not found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

// Start standalone server when executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const PORT = process.env.PORT || 3001;
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`CertiChain Certificate Service API listening on http://localhost:${PORT}`);
  });
}
