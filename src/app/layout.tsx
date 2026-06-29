import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ParaglideExam · Examen Piloto Básico Nivel 3',
  description:
    'App de estudio para el examen teórico de licencia de parapente Piloto Básico Nivel 3 (Federación Argentina de Vuelo Libre).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
