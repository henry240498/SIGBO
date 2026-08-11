'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cargarPublicaciones, PublicacionPublica } from '@/lib/publicaciones';

export default function PaginaPublica() {
  const [items, setItems] = useState<PublicacionPublica[]>([]);
  const [filtro, setFiltro] = useState('Todas');
  const [abierta, setAbierta] = useState<PublicacionPublica | null>(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => { cargarPublicaciones().then(setItems).catch(() => setItems([])); }, []);
  const visibles = useMemo(() => items.filter(p => p.visible && (filtro === 'Todas' || p.categoria === filtro)).sort((a,b) => a.orden-b.orden || b.fecha.localeCompare(a.fecha)), [items, filtro]);
  const destacada = visibles.find(p => p.destacada);

  return <div className="public-site">
    <header className="public-header">
      <a className="public-brand" href="#inicio"><span className="public-logo">CB</span><span><b>Página institucional</b><small>Bomberos voluntarios</small></span></a>
      <button className="public-menu-button" onClick={() => setMenu(!menu)} aria-label="Abrir menú">☰</button>
      <nav className={menu ? 'open' : ''} onClick={() => setMenu(false)}><a href="#inicio">Inicio</a><a href="#publicaciones">Publicaciones</a><a href="#contacto">Contacto</a></nav>
      <Link className="public-login" href="/login">Iniciar sesión</Link>
    </header>
    <main>
      <section id="inicio" className={`public-hero${destacada ? '' : ' empty'}`} style={destacada?.imagen ? {backgroundImage:`linear-gradient(90deg,rgba(8,31,60,.94),rgba(8,31,60,.38)),url(${destacada.imagen})`} : undefined}>
        {destacada ? <div className="public-hero-content"><span className="public-kicker" style={{color:destacada.color}}>{destacada.categoria}</span><h1>{destacada.titulo}</h1><p>{destacada.resumen}</p><button className="public-button" onClick={()=>setAbierta(destacada)}>Leer publicación</button></div> : <div className="public-empty hero-empty"><h1>Contenido institucional</h1><p>La información pública se mostrará aquí cuando sea cargada desde el módulo Publicaciones.</p></div>}
      </section>
      <section id="publicaciones" className="public-section soft">
        <div className="section-heading-public"><div><p className="public-kicker">Contenido público</p><h2>Publicaciones</h2></div><div className="filters">{['Todas','Noticia','Suceso','Evento','Logro'].map(x=><button className={filtro===x?'active':''} onClick={()=>setFiltro(x)} key={x}>{x}</button>)}</div></div>
        {visibles.length ? <div className="posts-grid">{visibles.map(p=><article className="post-card" key={p.id}>{p.imagen && <div className="post-image" style={{backgroundImage:`url(${p.imagen})`}}/>}<div><span style={{color:p.color}}>{p.categoria}</span><time>{new Date(`${p.fecha}T12:00:00`).toLocaleDateString('es-PY')}</time><h3>{p.titulo}</h3><p>{p.resumen}</p><button onClick={()=>setAbierta(p)}>Leer más →</button></div></article>)}</div> : <p className="public-empty">No hay publicaciones visibles en esta categoría.</p>}
      </section>
      <section id="contacto" className="contact-section"><div><p className="public-kicker">Contacto institucional</p><h2>Información pública</h2><p>Los datos de contacto se incorporarán mediante publicaciones visibles cuando la institución los configure.</p></div></section>
    </main>
    <footer className="public-footer"><div className="public-brand"><span className="public-logo">CB</span><span><b>Página institucional</b><small>Bomberos voluntarios</small></span></div><Link href="/login">Iniciar sesión</Link><p>© {new Date().getFullYear()} · Todos los derechos reservados</p></footer>
    {abierta && <div className="public-modal" role="dialog" aria-modal="true" onClick={()=>setAbierta(null)}><article style={{borderTopColor:abierta.color}} onClick={e=>e.stopPropagation()}><button aria-label="Cerrar" onClick={()=>setAbierta(null)}>×</button><span style={{color:abierta.color}}>{abierta.categoria}</span><h2>{abierta.titulo}</h2><time>{new Date(`${abierta.fecha}T12:00:00`).toLocaleDateString('es-PY')}</time>{abierta.imagen && <img src={abierta.imagen} alt=""/>}<p>{abierta.contenido}</p></article></div>}
  </div>;
}
