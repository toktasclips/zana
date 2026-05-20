import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kafi — Verimlilik Asistanın',
  description: 'Gününü daha verimli geçirmeni sağlayan kişisel asistanın.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kafi',
  },
};

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').then(reg => {
                // Listen for push messages forwarded from SW when tab is focused
                navigator.serviceWorker.addEventListener('message', event => {
                  if (event.data?.type !== 'push') return;
                  const toast = document.createElement('div');
                  toast.textContent = event.data.title + (event.data.body ? ': ' + event.data.body : '');
                  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1c1917;color:#fff;padding:12px 18px;border-radius:14px;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:320px;line-height:1.4;';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 4500);
                });
              }).catch(() => {});
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} h-full bg-stone-50`}>{children}</body>
    </html>
  );
}
