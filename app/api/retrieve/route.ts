import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // List all blobs with the metadata prefix for this code
    const { blobs } = await list({
      prefix: `metadata/${code}`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 404 }
      );
    }

    // Fetch the metadata JSON from the blob URL
    const metadataBlob = blobs[0];
    const response = await fetch(metadataBlob.url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve metadata' },
        { status: 500 }
      );
    }

    const metadata = await response.json();

    // Check if expired
    if (Date.now() > metadata.expiresAt) {
      return NextResponse.json(
        { error: 'Code has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      files: metadata.files,
      expiresAt: metadata.expiresAt,
    });
  } catch (error) {
    console.error('Retrieve error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}