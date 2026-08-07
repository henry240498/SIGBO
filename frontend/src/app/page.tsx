'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(obtenerSesion() ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
