'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
<<<<<<< Updated upstream
interface Options{titulo:string;mensaje:string;confirmar?:string;cancelar?:string;peligro?:boolean}
type Confirmar=(options:Options)=>Promise<boolean>;
const Context=createContext<Confirmar|null>(null);
export function ConfirmProvider({children}:{children:React.ReactNode}){const[options,setOptions]=useState<Options|null>(null),resolver=useRef<((v:boolean)=>void)|null>(null),panel=useRef<HTMLElement>(null),previous=useRef<HTMLElement|null>(null);const confirmar=useCallback<Confirmar>(next=>new Promise(resolve=>{resolver.current=resolve;setOptions(next)}),[]);const close=useCallback((result:boolean)=>{resolver.current?.(result);resolver.current=null;setOptions(null)},[]);useEffect(()=>{if(!options)return;previous.current=document.activeElement as HTMLElement;panel.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close(false)};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous.current?.focus()}},[options,close]);return <Context.Provider value={confirmar}>{children}{options&&<div className="confirm-overlay" onMouseDown={e=>e.target===e.currentTarget&&close(false)}><section ref={panel} tabIndex={-1} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">{options.titulo}</h2><p>{options.mensaje}</p><div><button type="button" className="service-secondary" onClick={()=>close(false)}>{options.cancelar||'Cancelar'}</button><button type="button" className={options.peligro?'confirm-danger':'btn-primary'} onClick={()=>close(true)}>{options.confirmar||'Confirmar'}</button></div></section></div>}</Context.Provider>}
export function useConfirmacion(){const value=useContext(Context);if(!value)throw new Error('useConfirmacion requiere ConfirmProvider');return value}
=======

interface ConfirmOptions{titulo:string;mensaje:string;confirmar?:string;cancelar?:string;peligro?:boolean}
type ConfirmFn=(options:ConfirmOptions)=>Promise<boolean>;
const ConfirmContext=createContext<ConfirmFn|null>(null);

export function ConfirmProvider({children}:{children:React.ReactNode}){
 const[options,setOptions]=useState<ConfirmOptions|null>(null),resolver=useRef<((value:boolean)=>void)|null>(null),panel=useRef<HTMLElement>(null),previous=useRef<HTMLElement|null>(null);
 const confirmar=useCallback<ConfirmFn>(next=>new Promise(resolve=>{resolver.current=resolve;setOptions(next)}),[]);
 const close=useCallback((result:boolean)=>{resolver.current?.(result);resolver.current=null;setOptions(null)},[]);
 useEffect(()=>{if(!options)return;previous.current=document.activeElement as HTMLElement;panel.current?.focus();function key(e:KeyboardEvent){if(e.key==='Escape')close(false);if(e.key==='Tab'&&panel.current){const nodes=[...panel.current.querySelectorAll<HTMLElement>('button:not([disabled])')],first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous.current?.focus()}},[options,close]);
 useEffect(()=>()=>resolver.current?.(false),[]);
 return <ConfirmContext.Provider value={confirmar}>{children}{options&&<div className="confirm-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close(false)}}><section ref={panel} tabIndex={-1} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><h2 id="confirm-title">{options.titulo}</h2><p id="confirm-description">{options.mensaje}</p><div><button type="button" className="service-secondary" onClick={()=>close(false)}>{options.cancelar||'Cancelar'}</button><button type="button" className={options.peligro?'confirm-danger':'btn-primary'} onClick={()=>close(true)}>{options.confirmar||'Confirmar'}</button></div></section></div>}</ConfirmContext.Provider>
}

export function useConfirmacion(){const value=useContext(ConfirmContext);if(!value)throw new Error('useConfirmacion requiere ConfirmProvider');return value}
>>>>>>> Stashed changes
