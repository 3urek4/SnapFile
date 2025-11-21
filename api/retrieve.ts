import { list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // List all blobs with the metadata prefix for this code
    const { blobs } = await list({
      prefix: `metadata/${code}`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }

    // Fetch the metadata JSON from the blob URL
    const metadataBlob = blobs[0];
    const response = await fetch(metadataBlob.url);

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to retrieve metadata' });
    }

    const metadata = await response.json();

    // Check if expired
    if (Date.now() > metadata.expiresAt) {
      return res.status(410).json({ error: 'Code has expired' });
    }

    return res.status(200).json({
      file: metadata.file,
      expiresAt: metadata.expiresAt,
    });
  } catch (error) {
    console.error('Retrieve error:', error);
    return res.status(500).json({ error: 'Failed to retrieve file' });
  }
}