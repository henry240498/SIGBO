import type { Metadata } from 'next';
import './globals.css';
import { ConfigBootstrap } from './components/ConfigBootstrap';
<<<<<<< Updated upstream
import { ConfirmProvider } from './components/ConfirmProvider';
import { ExperienceGuard } from './components/ExperienceGuard';
=======
import { ExperienceGuard } from './components/ExperienceGuard';
import { ConfirmProvider } from './components/ConfirmProvider';
>>>>>>> Stashed changes

export const metadata: Metadata = {
  title: 'SIGBO-CBVC',
  description: 'Sistema Integral de Gestion para Bomberos Voluntarios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body><ConfirmProvider><a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a><ExperienceGuard/>{children}<ConfigBootstrap /></ConfirmProvider></body>
    </html>
  );
}
