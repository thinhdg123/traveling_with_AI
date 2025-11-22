'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { useAuth } from '@/hooks/useAuth'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import ChatBox from '@/components/Chat_box';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Global authentication state management
  useAuth();

  return (
    <html lang="vi">
      <body className={inter.className}>
        <ToastContainer
          position="top-center"
          autoClose={1000}
          limit={3}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
          style={{ zIndex: 9999 }}
        />
        {children}
        <ChatBox style={{ left: '30%', bottom: '1.5rem', marginLeft: '1.5rem', right: 'auto' }} />
      </body>
    </html>
  );
}