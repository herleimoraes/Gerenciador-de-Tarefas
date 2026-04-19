import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'TaskFlow Vibrant',
  description: 'Vibrant task management with photos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="bg-slate-800 text-slate-800 antialiased min-h-[100dvh] flex justify-center items-center">
        <AuthProvider>
          <div className="w-full max-w-[375px] h-[100dvh] sm:h-[667px] sm:rounded-[40px] sm:border-[8px] sm:border-slate-900 bg-slate-50 shadow-2xl relative overflow-hidden flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
