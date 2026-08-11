import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface PublicacionPublica {
  id: string; titulo: string; resumen: string; contenido: string; fecha: string;
  categoria: 'Noticia' | 'Suceso' | 'Evento' | 'Logro'; imagen: string;
  visible: boolean; destacada: boolean; orden: number; color: string;
}

@Injectable()
export class PublicacionesService {
  private readonly archivo = join(process.cwd(), 'storage', 'publicaciones.json');

  async listar(todas = false): Promise<PublicacionPublica[]> {
    const items = await this.leer();
    return items.filter(x => todas || x.visible).sort((a,b) => a.orden-b.orden || b.fecha.localeCompare(a.fecha));
  }

  async reemplazar(items: PublicacionPublica[]): Promise<PublicacionPublica[]> {
    await fs.mkdir(join(process.cwd(), 'storage'), { recursive: true });
    const temporal = `${this.archivo}.tmp`;
    await fs.writeFile(temporal, JSON.stringify(items, null, 2), 'utf8');
    await fs.rename(temporal, this.archivo);
    return this.listar(true);
  }

  private async leer(): Promise<PublicacionPublica[]> {
    try { const data = JSON.parse(await fs.readFile(this.archivo, 'utf8')); return Array.isArray(data) ? data : []; }
    catch (error: any) { if (error?.code === 'ENOENT') return []; throw error; }
  }
}
