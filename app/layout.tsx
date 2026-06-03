import type { Metadata, Viewport } from 'next';
import { Gowun_Dodum } from 'next/font/google';
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar';
import './globals.css';

const gowunDodum = Gowun_Dodum({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gowun-dodum',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '두잎',
  description: 'DO-IF · 부부가 함께 키우는 가능성의 정원',
  applicationName: '두잎',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '두잎',
  },
  icons: {
    apple: '/icon-192.png',
  },
  openGraph: {
    title: '두잎',
    description: 'DO-IF · 부부가 함께 키우는 가능성의 정원',
    siteName: 'DUIP',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#5C3A1F',
  interactiveWidget: 'resizes-content', // 키보드 올라올 때 fixed 요소 함께 이동
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${gowunDodum.variable}`}>
      <body className="min-h-full bg-[#FBF6EE]">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
