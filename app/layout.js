import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/sonner"
import '@/styles/globals.css';

export const metadata = {
  title: 'Restaurant App',
  description: 'Restaurant management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}