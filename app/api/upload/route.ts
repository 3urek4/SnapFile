import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const code = generateCode();
    const uploadedFiles = [];

    // Upload each file to Vercel Blob
    for (const file of files) {
      const blob = await put(`${code}/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      uploadedFiles.push({
        filename: file.name,
        url: blob.url,
        size: file.size,
      });
    }

    // Store metadata with expiration (24 hours from now)
    const metadata = {
      code,
      files: uploadedFiles,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Store metadata in Vercel Blob as JSON
    await put(`metadata/${code}.json`, JSON.stringify(metadata), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ code, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}