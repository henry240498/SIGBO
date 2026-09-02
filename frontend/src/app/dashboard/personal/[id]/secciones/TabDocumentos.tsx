'use client';

import { DocumentosDeEntidad } from '@/components/DocumentosDeEntidad';

export function TabDocumentos({ bomberoId }: { bomberoId: string }) {
  return <DocumentosDeEntidad modulo="personal" entidad="bombero" registroId={bomberoId} titulo="Documentos de la persona" />;
}

/* ------------------------------------------------------------------ */
/* Foja de servicio                                                     */
/* ------------------------------------------------------------------ */
