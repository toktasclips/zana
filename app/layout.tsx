import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kafi — Verimlilik Asistanın',
  description: 'Gününü daha verimli geçirmeni sağlayan kişisel asistanın.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
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
                notifyButton: { enable: true },
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
