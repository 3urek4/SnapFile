import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transfer - Simple File Sharing',
  description: 'Share files securely between devices with 24-hour auto-deletion',
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