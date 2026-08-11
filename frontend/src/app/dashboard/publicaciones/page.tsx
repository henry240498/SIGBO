'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { cargarPublicaciones, CategoriaPublicacion, guardarPublicaciones, PublicacionPublica } from '@/lib/publicaciones';

const vacia = (): PublicacionPublica => ({ id: '', titulo: '', resumen: '', contenido: '', fecha: '', categoria: 'Noticia', imagen: '', visible: true, destacada: false, orden: 1, color: '#2563eb' });

export default function PublicacionesPage() {
  const [items, setItems] = useState<PublicacionPublica[]>([]);
  const [form, setForm] = useState<PublicacionPublica>(vacia());
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { cargarPublicaciones(true).then(setItems).catch(e => setError(e.message)); }, []);
  async function persistir(next: PublicacionPublica[]) { try { setError(''); setItems(await guardarPublicaciones(next)); } catch(e:any) { setError(e.message); } }
  function cambiar<K extends keyof PublicacionPublica>(campo: K, valor: PublicacionPublica[K]) { setForm(v => ({...v, [campo]: valor})); }
  function imagen(e: ChangeEvent<HTMLInputElement>) { const file=e.target.files?.[0]; if(!file) return; if(file.size>2_000_000){alert('La imagen no puede superar 2 MB.'); return;} const reader=new FileReader(); reader.onload=()=>cambiar('imagen', String(reader.result)); reader.readAsDataURL(file); }
  async function guardar(e: FormEvent) { e.preventDefault(); const registro={...form,id:form.id || crypto.randomUUID(),orden:Number(form.orden)}; await persistir(editando ? items.map(x=>x.id===registro.id?registro:x) : [...items,registro]); setForm(vacia()); setEditando(false); }
  function editar(item: PublicacionPublica){setForm({...item});setEditando(true);window.scrollTo({top:0,behavior:'smooth'});}
  function eliminar(id:string){if(confirm('¿Eliminar esta publicación?')) persistir(items.filter(x=>x.id!==id));}
  function toggle(item:PublicacionPublica){persistir(items.map(x=>x.id===item.id?{...x,visible:!x.visible}:x));}

  return <div className="publication-admin">
    <div className="service-heading"><div><span className="topbar-eyebrow">Página pública</span><h2>{editando?'Editar publicación':'Nueva publicación'}</h2><p>Cada registro mantiene su contenido, apariencia y visibilidad de forma independiente.</p></div><a className="service-secondary" href="/" target="_blank">Ver página pública</a></div>
    <form className="card publication-form" onSubmit={guardar}>
      {error && <div className="service-validation">{error}</div>}
      <div className="publication-grid">
        <label>Título<input className="input-field" value={form.titulo} onChange={e=>cambiar('titulo',e.target.value)} required maxLength={160}/></label>
        <label>Fecha<input className="input-field" type="date" value={form.fecha} onChange={e=>cambiar('fecha',e.target.value)} required/></label>
        <label>Categoría<select className="input-field" value={form.categoria} onChange={e=>cambiar('categoria',e.target.value as CategoriaPublicacion)}>{['Noticia','Suceso','Evento','Logro'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Orden<input className="input-field" type="number" min="0" value={form.orden} onChange={e=>cambiar('orden',Number(e.target.value))} required/></label>
        <label className="wide">Resumen<textarea className="input-field" rows={2} value={form.resumen} onChange={e=>cambiar('resumen',e.target.value)} required maxLength={320}/></label>
        <label className="wide">Contenido completo<textarea className="input-field" rows={7} value={form.contenido} onChange={e=>cambiar('contenido',e.target.value)} required/></label>
        <label>Color de acento<input className="publication-color" type="color" value={form.color} onChange={e=>cambiar('color',e.target.value)}/></label>
        <label>Imagen<input className="input-field" type="file" accept="image/png,image/jpeg,image/webp" onChange={imagen}/></label>
        {form.imagen && <div className="publication-preview wide"><img src={form.imagen} alt="Vista previa"/><button type="button" onClick={()=>cambiar('imagen','')}>Quitar imagen</button></div>}
        <label className="service-toggle"><input type="checkbox" checked={form.visible} onChange={e=>cambiar('visible',e.target.checked)}/>Visible en la página pública</label>
        <label className="service-toggle"><input type="checkbox" checked={form.destacada} onChange={e=>cambiar('destacada',e.target.checked)}/>Usar como publicación destacada</label>
      </div>
      <div className="service-actions"><button className="btn-primary" type="submit">{editando?'Guardar cambios':'Crear publicación'}</button>{editando&&<button className="service-secondary" type="button" onClick={()=>{setForm(vacia());setEditando(false)}}>Cancelar</button>}</div>
    </form>
    <div className="section-heading"><h2>Publicaciones creadas</h2><span>{items.length} registros</span></div>
    {items.length ? <div className="publication-list">{[...items].sort((a,b)=>a.orden-b.orden).map(item=><article className="card" key={item.id}>{item.imagen&&<img src={item.imagen} alt=""/>}<div><span className="service-status" style={{borderColor:item.color,color:item.color}}>{item.categoria}</span><h3>{item.titulo}</h3><p>{item.resumen}</p><small>Orden {item.orden} · {item.visible?'Visible':'Oculta'}{item.destacada?' · Destacada':''}</small></div><div className="publication-actions"><button onClick={()=>toggle(item)}>{item.visible?'Ocultar':'Mostrar'}</button><button onClick={()=>editar(item)}>Editar</button><button className="danger" onClick={()=>eliminar(item.id)}>Eliminar</button></div></article>)}</div> : <div className="card public-empty">Todavía no hay publicaciones. Creá la primera con el formulario superior.</div>}
  </div>;
}
