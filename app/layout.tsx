import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SnapFile - Simple File Sharing',
  description: 'Share files securely between devices with 24-hour auto-deletion. Made by 3urek4.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}