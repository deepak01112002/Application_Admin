import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import '@/lib/dev-error-patch'; // Apply development error patches

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ghanshyam Murti Bhandar - Admin Panel',
  description: 'Complete admin dashboard for managing ecommerce operations',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Admin Panel',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Admin Panel" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Prevent zoom on input focus */
            input, select, textarea {
              font-size: 16px !important;
            }

            /* Smooth scrolling for webview */
            html {
              scroll-behavior: smooth;
              -webkit-text-size-adjust: 100%;
            }

            /* Prevent selection and callouts */
            * {
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
            }

            /* Allow text selection in inputs and content areas */
            input, textarea, [contenteditable] {
              -webkit-user-select: text;
            }
          `
        }} />
      </head>
      <body className={`${inter.className} webview-optimized`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
