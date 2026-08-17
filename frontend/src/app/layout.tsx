import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata = {
  title: 'Zealthy - Mini EMR & Patient Portal',
  description: 'Full Stack Engineering Exercise',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light">
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}