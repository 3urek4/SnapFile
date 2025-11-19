import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Fetch metadata from Vercel Blob
    const metadataUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? 'https://' + process.env.BLOB_READ_WRITE_TOKEN.split('_')[1] + '.public.blob.vercel-storage.com' : ''}/metadata/${code}.json`;
    
    // Try to fetch from Vercel Blob
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 404 }
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