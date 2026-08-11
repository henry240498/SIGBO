import type { Metadata } from 'next';
import './globals.css';
import { ConfigBootstrap } from './components/ConfigBootstrap';

export const metadata: Metadata = {
  title: 'SIGBO-CBVC',
  description: 'Sistema Integral de Gestion para Bomberos Voluntarios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}<ConfigBootstrap /></body>
    </html>
  );
}
