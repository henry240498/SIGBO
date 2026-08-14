'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
<<<<<<< Updated upstream
export function ExperienceGuard(){const pathname=usePathname(),[online,setOnline]=useState(true),[announcement,setAnnouncement]=useState('');useEffect(()=>{setOnline(navigator.onLine);const up=()=>setOnline(true),down=()=>setOnline(false);addEventListener('online',up);addEventListener('offline',down);return()=>{removeEventListener('online',up);removeEventListener('offline',down)}},[]);useEffect(()=>setAnnouncement(`Página cargada: ${document.querySelector('h1')?.textContent?.trim()||document.title}`),[pathname]);return <><div className="sr-only" aria-live="polite">{announcement}</div>{!online&&<div className="network-status" role="status">Sin conexión. Los cambios no podrán guardarse.</div>}</>}
=======

export function ExperienceGuard(){
 const pathname=usePathname(),[online,setOnline]=useState(true),[announcement,setAnnouncement]=useState('');
 useEffect(()=>{setOnline(navigator.onLine);const up=()=>setOnline(true),down=()=>setOnline(false);addEventListener('online',up);addEventListener('offline',down);return()=>{removeEventListener('online',up);removeEventListener('offline',down)}},[]);
 useEffect(()=>{const title=document.querySelector('h1')?.textContent?.trim()||document.title;setAnnouncement(`Página cargada: ${title}`)},[pathname]);
 return <><div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>{!online&&<div className="network-status" role="status" aria-live="polite">Sin conexión. Los cambios que requieren acceso al servidor no podrán guardarse.</div>}</>;
}
>>>>>>> Stashed changes
