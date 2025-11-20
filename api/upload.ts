import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Get the file from the request
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    // Parse the multipart data manually
    const boundary = contentType.split('boundary=')[1];
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let fileSize = 0;

    for (const part of parts) {
      if (part.includes('Content-Disposition')) {
        const nameMatch = part.match(/name="([^"]+)"/);
        const filenameMatch = part.match(/filename="([^"]+)"/);
        
        if (nameMatch && nameMatch[1] === 'file' && filenameMatch) {
          filename = filenameMatch[1];
          const contentStart = part.indexOf('\r\n\r\n') + 4;
          const contentEnd = part.lastIndexOf('\r\n');
          const content = part.substring(contentStart, contentEnd);
          fileBuffer = Buffer.from(content, 'binary');
          fileSize = fileBuffer.length;
          break;
        }
      }
    }

    if (!fileBuffer || !filename) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const code = generateCode();

    // Upload file to Vercel Blob
    const blob = await put(`${code}/${filename}`, fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const fileInfo = {
      filename,
      url: blob.url,
      size: fileSize,
    };

    // Store metadata
    const metadata = {
      code,
      file: fileInfo,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    await put(`metadata/${code}.json`, JSON.stringify(metadata), {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ code, file: fileInfo });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}