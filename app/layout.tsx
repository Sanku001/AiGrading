import React from 'react';

export const metadata = {
  title: 'AI Grading Assistant MVP',
  description: 'Minimal AI grading web app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        {children}
      </body>
    </html>
  );
}