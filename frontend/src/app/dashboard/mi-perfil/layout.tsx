'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function PerfilLayout({children}:{children:React.ReactNode}){const path=usePathname();const tabs=[['/dashboard/mi-perfil','Perfil'],['/dashboard/mi-perfil/preferencias','Preferencias'],['/dashboard/mi-perfil/seguridad','Seguridad']];return <div><nav className="profile-tabs" aria-label="Mi cuenta">{tabs.map(([href,label])=><Link key={href} className={path===href?'active':''} href={href}>{label}</Link>)}</nav>{children}</div>}
