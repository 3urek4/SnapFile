import { SnapFile, TransferSession, StorageResponse } from '../types';

// MOCK IMPLEMENTATION
// In a real production environment using Vercel Blob, this service would:
// 1. Call a server-side Next.js API route to handle the upload securely.
// 2. The API route would use @vercel/blob `put` method.
// 3. We would return the blob URL.
//
// For this standalone frontend demo, we use localStorage to simulate the "Cloud".

const STORAGE_KEY_PREFIX = 'snapfile_session_';

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const uploadFiles = async (files: SnapFile[], summary?: string): Promise<StorageResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const code = generateCode();
    const session: TransferSession = {
      code,
      files,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      summary
    };

    // Store in localStorage (Mocking Cloud DB)
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${code}`, JSON.stringify(session));
    } catch (e) {
      return { success: false, error: 'File size too large for browser demo storage.' };
    }

    return { success: true, code };
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
};

export const retrieveFiles = async (code: string): Promise<StorageResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${code}`);
    
    if (!data) {
      return { success: false, error: 'Invalid code or expired session.' };
    }

    const session: TransferSession = JSON.parse(data);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${code}`);
      return { success: false, error: 'Session expired.' };
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: 'Retrieval failed' };
  }
};