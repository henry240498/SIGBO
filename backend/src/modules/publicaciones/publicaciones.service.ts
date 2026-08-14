import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Publicacion, Servicio, TipoServicio, Vehiculo } from '../../shared/entities';

export type SeccionPublica='PORTADA'|'RESUMEN'|'HISTORIA'|'FLOTA'|'LOGRO'|'NOTICIA'|'SUCESO'|'EVENTO'|'TRANSPARENCIA'|'CONTACTO'|'FOOTER';
export type EstadoContenido='BORRADOR'|'PROGRAMADA'|'PUBLICADA'|'ARCHIVADA';
export interface PublicacionPublica {
  id:string;seccion:SeccionPublica;titulo:string;subtitulo:string;resumen:string;contenido:string;
  fecha:string;fechaFin:string;hora:string;ubicacion:string;categoria:string;etiquetas:string[];
  imagen:string;imagenAlt:string;color:string;botonTexto:string;enlace:string;
  visible:boolean;destacada:boolean;orden:number;estado:EstadoContenido;publicarEn:string;caducarEn:string;
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectRepository(Servicio) private readonly servicios:Repository<Servicio>,
    @InjectRepository(TipoServicio) private readonly tipos:Repository<TipoServicio>,
    @InjectRepository(Bombero) private readonly bomberos:Repository<Bombero>,
    @InjectRepository(Vehiculo) private readonly vehiculos:Repository<Vehiculo>,
    @InjectRepository(Publicacion) private readonly publicaciones:Repository<Publicacion>,
  ){}
  async listar(todas=false){const rows=await this.publicaciones.find({order:{orden:'ASC',fecha:'DESC'}});const items=rows.map(x=>this.normalizar(JSON.parse(x.contenidoJson)));const now=new Date();return items.filter(x=>todas||this.publicable(x,now));}
  async crear(item:PublicacionPublica){const value=this.validar(this.normalizar(item));if(await this.publicaciones.exist({where:{id:value.id}}))throw new BadRequestException('Ya existe una publicación con ese identificador');await this.guardar(value);return value;}
  async actualizar(id:string,item:PublicacionPublica){if(!await this.publicaciones.exist({where:{id}}))throw new NotFoundException('La publicación no existe');const value=this.validar(this.normalizar({...item,id}));await this.guardar(value);return value;}
  async eliminar(id:string){const result=await this.publicaciones.delete(id);if(!result.affected)throw new NotFoundException('La publicación no existe');return{ok:true};}
<<<<<<< Updated upstream
=======
  async reemplazar(items:PublicacionPublica[]){if(!Array.isArray(items))throw new BadRequestException('Se esperaba una lista de contenidos');const normalized=items.map(x=>this.validar(this.normalizar(x)));const ids=new Set(normalized.map(x=>x.id));if(ids.size!==normalized.length)throw new BadRequestException('Hay identificadores duplicados');await this.publicaciones.manager.transaction(async manager=>{const repo=manager.getRepository(Publicacion);const actuales=await repo.find();const recibidos=new Set(normalized.map(x=>x.id));const removidos=actuales.filter(x=>!recibidos.has(x.id));if(removidos.length)await repo.remove(removidos);for(const x of normalized){const actual=await repo.findOne({where:{id:x.id}});await repo.save(repo.create({...actual,id:x.id,seccion:x.seccion,estado:x.estado,visible:x.visible,destacada:x.destacada,orden:x.orden,fecha:x.fecha||null,publicarEn:x.publicarEn?new Date(x.publicarEn):null,caducarEn:x.caducarEn?new Date(x.caducarEn):null,contenidoJson:JSON.stringify(x)}));}});return this.listar(true);}
>>>>>>> Stashed changes
  async estadisticas(anio?:number){
    const todos=anio===0;const year=todos?0:anio&&anio>=2000&&anio<=2100?anio:new Date().getFullYear();
    const servicios=await this.servicios.createQueryBuilder('s').where("s.estado <> 'CANCELADO'").orderBy('s.fechaHoraAviso','ASC').getMany();
    const activos=await this.bomberos.count({where:{estado:'ACTIVO'}});const vehiculos=await this.vehiculos.find();const tipos=await this.tipos.find();
    const delAnio=todos?servicios:servicios.filter(s=>new Date(s.fechaHoraAviso).getFullYear()===year);const mesActual=new Date().getMonth();
    const porMes=Array.from({length:12},(_,i)=>({mes:i+1,total:delAnio.filter(s=>new Date(s.fechaHoraAviso).getMonth()===i).length}));
    const porDia=new Map<string,number>();for(const s of servicios){const k=new Date(s.fechaHoraAviso).toISOString().slice(0,10);porDia.set(k,(porDia.get(k)||0)+1)}
    const dias=[...porDia].sort((a,b)=>b[1]-a[1]);const porAnio=new Map<number,number>();for(const s of servicios){const y=new Date(s.fechaHoraAviso).getFullYear();porAnio.set(y,(porAnio.get(y)||0)+1)}
    const fechas=servicios.map(s=>new Date(s.fechaHoraAviso)).sort((a,b)=>a.getTime()-b.getTime());let gap:{ms:number;desde:Date;hasta:Date}|null=null;for(let i=1;i<fechas.length;i++){const ms=fechas[i].getTime()-fechas[i-1].getTime();if(!gap||ms>gap.ms)gap={ms,desde:fechas[i-1],hasta:fechas[i]}}
    const rows=await this.servicios.createQueryBuilder('s').innerJoin(TipoServicio,'t','t.id=s.tipoServicioId').select('t.nombre','nombre').addSelect('COUNT(*)','total').where("s.estado <> 'CANCELADO'").groupBy('t.nombre').getRawMany();
    const diasSemana=Array.from({length:7},(_,dia)=>({dia,total:servicios.filter(s=>new Date(s.fechaHoraAviso).getDay()===dia).length}));
    const mesesHistoricos=new Map<string,number>();for(const s of servicios){const d=new Date(s.fechaHoraAviso);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;mesesHistoricos.set(k,(mesesHistoricos.get(k)||0)+1)}
    const extremos=<T extends {total:number}>(values:T[])=>{if(!values.length)return{maximo:null,minimo:null};const sorted=[...values].sort((a,b)=>b.total-a.total);return{maximo:{...sorted[0],empate:sorted.filter(x=>x.total===sorted[0].total).length>1},minimo:{...sorted[sorted.length-1],empate:sorted.filter(x=>x.total===sorted[sorted.length-1].total).length>1}}};
    const tipoMap=new Map(tipos.map(t=>[t.id,`${t.codigo} ${t.nombre}`.toUpperCase()]));
    const categoria=(s:Servicio)=>{const value=tipoMap.get(s.tipoServicioId)||'';return value.includes('INCEND')?'INCENDIOS':value.includes('ACCID')||value.includes('SINIEST')?'ACCIDENTES':'OTROS'};
    const recordsCategoria=['INCENDIOS','ACCIDENTES','OTROS'].map(nombre=>{const subset=servicios.filter(s=>categoria(s)===nombre);const byMonth=new Map<string,number>(),byDay=new Map<string,number>();for(const s of subset){const d=new Date(s.fechaHoraAviso),m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,day=d.toISOString().slice(0,10);byMonth.set(m,(byMonth.get(m)||0)+1);byDay.set(day,(byDay.get(day)||0)+1)}return{nombre,total:subset.length,porcentaje:servicios.length?Number((subset.length*100/servicios.length).toFixed(1)):0,mesMaximo:extremos([...byMonth].map(([periodo,total])=>({periodo,total}))).maximo,diaMaximo:extremos([...byDay].map(([fecha,total])=>({fecha,total}))).maximo}});
    const monthValues=[...mesesHistoricos].map(([periodo,total])=>({periodo,total})),yearValues=[...porAnio].map(([periodo,total])=>({periodo,total}));
    const weekdayExtremes=extremos(servicios.length?diasSemana:[]),monthExtremes=extremos(monthValues),yearExtremes=extremos(yearValues);
    const tipoFrecuente=rows.length?[...rows].map(r=>({nombre:String(r.nombre),total:Number(r.total)})).sort((a,b)=>b.total-a.total)[0]:null;
    return {anio:year,anios:[...porAnio].sort((a,b)=>a[0]-b[0]).map(([anio,total])=>({anio,total})),indicadores:{totalHistorico:servicios.length,totalAnio:delAnio.length,totalMes:delAnio.filter(s=>new Date(s.fechaHoraAviso).getMonth()===mesActual).length,personalActivo:activos,movilesDisponibles:vehiculos.filter(v=>v.estado==='OPERATIVO').length,ultimoServicio:fechas.length?fechas[fechas.length-1].toISOString():null},flota:{total:vehiculos.length,operativos:vehiculos.filter(v=>v.estado==='OPERATIVO').length,mantenimiento:vehiculos.filter(v=>v.estado==='EN_MANTENIMIENTO').length,fueraServicio:vehiculos.filter(v=>v.estado==='FUERA_SERVICIO'||v.estado==='BAJA').length},porMes,porAnio:yearValues.map(x=>({anio:x.periodo,total:x.total})).sort((a,b)=>a.anio-b.anio),porDiaSemana:diasSemana,porTipo:rows.map(r=>({nombre:r.nombre,total:Number(r.total)})),comparacion:{actual:porAnio.get(year)||0,anterior:porAnio.get(year-1)||0},records:{diaMaximo:dias[0]?{fecha:dias[0][0],total:dias[0][1],empate:dias.filter(x=>x[1]===dias[0][1]).length>1}:null,periodoSinServicios:gap?{desde:gap.desde.toISOString(),hasta:gap.hasta.toISOString(),horas:Math.floor(gap.ms/3600000)}:null,diaSemanaMaximo:weekdayExtremes.maximo,diaSemanaMinimo:weekdayExtremes.minimo,mesMaximo:monthExtremes.maximo,mesMinimo:monthExtremes.minimo,anioMaximo:yearExtremes.maximo,tipoFrecuente,promedioMensual:servicios.length?Number((servicios.length/Math.max(1,mesesHistoricos.size)).toFixed(1)):null,promedioDiario:servicios.length?Number((servicios.length/Math.max(1,porDia.size)).toFixed(1)):null,porCategoria:recordsCategoria}};
  }
  private publicable(x:PublicacionPublica,now:Date){if(!x.visible||x.estado==='BORRADOR'||x.estado==='ARCHIVADA')return false;if(x.estado==='PROGRAMADA'&&(!x.publicarEn||new Date(x.publicarEn)>now))return false;if(x.caducarEn&&new Date(x.caducarEn)<=now)return false;return true;}
  private async guardar(x:PublicacionPublica){const actual=await this.publicaciones.findOne({where:{id:x.id}});await this.publicaciones.save(this.publicaciones.create({...actual,id:x.id,seccion:x.seccion,estado:x.estado,visible:x.visible,destacada:x.destacada,orden:x.orden,fecha:x.fecha||null,publicarEn:x.publicarEn?new Date(x.publicarEn):null,caducarEn:x.caducarEn?new Date(x.caducarEn):null,contenidoJson:JSON.stringify(x)}));}
  private validar(x:PublicacionPublica){const sections:SeccionPublica[]=['PORTADA','RESUMEN','HISTORIA','FLOTA','LOGRO','NOTICIA','SUCESO','EVENTO','TRANSPARENCIA','CONTACTO','FOOTER'];const states:EstadoContenido[]=['BORRADOR','PROGRAMADA','PUBLICADA','ARCHIVADA'];if(!x.id||!x.titulo?.trim())throw new BadRequestException('Cada contenido requiere identificador y título');if(!sections.includes(x.seccion)||!states.includes(x.estado))throw new BadRequestException(`Sección o estado inválido en ${x.titulo}`);if(!/^#[0-9a-f]{6}$/i.test(x.color))throw new BadRequestException(`Color inválido en ${x.titulo}`);if(x.imagen&&x.imagen.length>2_800_000)throw new BadRequestException(`La imagen de ${x.titulo} supera el límite`);if(x.enlace&&!/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(x.enlace))throw new BadRequestException(`Enlace inválido en ${x.titulo}`);return x;}
  private normalizar(x:Partial<PublicacionPublica>):PublicacionPublica{return{id:String(x.id||''),seccion:(x.seccion||this.legacySection(x)) as SeccionPublica,titulo:String(x.titulo||''),subtitulo:String(x.subtitulo||''),resumen:String(x.resumen||''),contenido:String(x.contenido||''),fecha:String(x.fecha||''),fechaFin:String(x.fechaFin||''),hora:String(x.hora||''),ubicacion:String(x.ubicacion||''),categoria:String(x.categoria||''),etiquetas:Array.isArray(x.etiquetas)?x.etiquetas.map(String):[],imagen:String(x.imagen||''),imagenAlt:String(x.imagenAlt||''),color:String(x.color||'#2563eb'),botonTexto:String(x.botonTexto||''),enlace:String(x.enlace||''),visible:x.visible!==false,destacada:!!x.destacada,orden:Number(x.orden||0),estado:(x.estado||'PUBLICADA') as EstadoContenido,publicarEn:String(x.publicarEn||''),caducarEn:String(x.caducarEn||'')}}
  private legacySection(x:Partial<PublicacionPublica>){const c=String(x.categoria||'').toUpperCase();return(['NOTICIA','SUCESO','EVENTO','LOGRO'].includes(c)?c:'NOTICIA') as SeccionPublica;}
}
