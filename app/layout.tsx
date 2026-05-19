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
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "622779c8-8665-45eb-be02-07c0ae16282d",
                safari_web_id: "web.onesignal.auto.01b20842-ed7c-48c4-bd42-e78491d78625",
                notifyButton: { enable: false },
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `}
        </Script>
      </head>
      <body className={`${inter.className} h-full bg-stone-50`}>{children}</body>
    </html>
  );
}
