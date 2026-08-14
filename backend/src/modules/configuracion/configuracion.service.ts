import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfiguracionValor, ConfiguracionVersion } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CONFIG_BY_KEY, CONFIG_REGISTRY, ConfigDefinition } from './configuracion.registry';

export interface ConfigResolved { value: unknown; source: 'SYSTEM'|'GLOBAL'|'USER'|'DEVICE'|'PREVIEW'; overridable: boolean; }

@Injectable()
export class ConfiguracionService {
  constructor(
    @InjectRepository(ConfiguracionValor) private readonly valoresRepo: Repository<ConfiguracionValor>,
    @InjectRepository(ConfiguracionVersion) private readonly versionesRepo: Repository<ConfiguracionVersion>,
    private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  registro(publicOnly = false) { return CONFIG_REGISTRY.filter(x => !publicOnly || x.public); }

  async resolver(usuarioId?: string, device: Record<string, unknown> = {}, preview: Record<string, unknown> = {}) {
    const globales = await this.valoresRepo.find({ where: { alcance: 'GLOBAL' } });
    const personales = usuarioId ? await this.valoresRepo.find({ where: { alcance: 'USUARIO', usuarioId } }) : [];
    const gm = this.toMap(globales), um = this.toMap(personales);
    const result: Record<string, ConfigResolved> = {};
    for (const def of CONFIG_REGISTRY) {
      let value=def.defaultValue, source:ConfigResolved['source']='SYSTEM';
      if (gm.has(def.key)) { value=gm.get(def.key); source='GLOBAL'; }
      if (def.userOverride && um.has(def.key)) { value=um.get(def.key); source='USER'; }
      if (def.userOverride && Object.prototype.hasOwnProperty.call(device,def.key)) { value=device[def.key]; source='DEVICE'; }
      if (Object.prototype.hasOwnProperty.call(preview,def.key)) { value=preview[def.key]; source='PREVIEW'; }
      result[def.key]={value,source,overridable:def.userOverride};
    }
    return result;
  }

  async publica() {
    const all=await this.resolver(); const values:Record<string,ConfigResolved>={};
    for(const def of CONFIG_REGISTRY) if(def.public) values[def.key]=all[def.key];
    const version=await this.versionPublicada();
    return {version:version?.numero??0,values};
  }

  async preferencias(usuarioId:string){
    const rows=await this.valoresRepo.find({where:{alcance:'USUARIO',usuarioId}});
    return {values:Object.fromEntries(rows.map(x=>[x.clave,JSON.parse(x.valorJson)])),effective:await this.resolver(usuarioId)};
  }

  async guardarPreferencias(usuarioId:string, values:Record<string,unknown>){
    this.validar(values,true);
    await this.dataSource.transaction(async manager=>{
      for(const [clave,valor] of Object.entries(values)){
        const repo=manager.getRepository(ConfiguracionValor);
        const actual=await repo.findOne({where:{clave,alcance:'USUARIO',usuarioId}});
        if(actual){actual.valorJson=JSON.stringify(valor);actual.version+=1;actual.actualizadoPor=usuarioId;await repo.save(actual);}
        else await repo.save(repo.create({clave,alcance:'USUARIO',usuarioId,valorJson:JSON.stringify(valor),version:1,actualizadoPor:usuarioId}));
      }
    });
    await this.auditoria.registrar({usuarioId,accion:'ACTUALIZAR_PREFERENCIAS',recurso:'configuracion.usuario',recursoId:usuarioId,datosDespues:Object.keys(values)});
    return this.preferencias(usuarioId);
  }

  async crearBorrador(actorId:string){
    const existente=await this.versionesRepo.findOne({where:{estado:'BORRADOR'},order:{creadoEn:'DESC'}});
    if(existente) return this.serializarVersion(existente);
    const actual=await this.valoresRepo.find({where:{alcance:'GLOBAL'}});
    const max=await this.versionesRepo.createQueryBuilder('v').select('MAX(v.numero)','max').getRawOne();
    const base=await this.versionPublicada();
    const row=await this.versionesRepo.save(this.versionesRepo.create({numero:Number(max?.max??0)+1,estado:'BORRADOR',valoresJson:JSON.stringify(Object.fromEntries(actual.map(x=>[x.clave,JSON.parse(x.valorJson)]))),motivo:null,baseVersion:base?.numero??0,creadoPor:actorId,publicadoPor:null,publicadoEn:null}));
    await this.auditoria.registrar({usuarioId:actorId,accion:'CREAR_BORRADOR',recurso:'configuracion.global',recursoId:row.id});
    return this.serializarVersion(row);
  }

  async obtenerBorrador(id:string){const row=await this.versionesRepo.findOne({where:{id}});if(!row||row.estado!=='BORRADOR')throw new NotFoundException('Borrador no encontrado');return this.serializarVersion(row);}
  async actualizarBorrador(id:string,values:Record<string,unknown>,motivo:string|undefined,actorId:string){
    const row=await this.versionesRepo.findOne({where:{id}});if(!row||row.estado!=='BORRADOR')throw new NotFoundException('Borrador no encontrado');
    this.validar(values,false); row.valoresJson=JSON.stringify(values);row.motivo=motivo??row.motivo;await this.versionesRepo.save(row);
    await this.auditoria.registrar({usuarioId:actorId,accion:'EDITAR_BORRADOR',recurso:'configuracion.global',recursoId:id,datosDespues:Object.keys(values)});
    return this.serializarVersion(row);
  }
  async validarBorrador(id:string){const b=await this.obtenerBorrador(id);return {valid:true,warnings:this.advertenciasContraste(b.values),errors:[]};}
  async publicar(id:string,actorId:string){
    const row=await this.versionesRepo.findOne({where:{id}});if(!row||row.estado!=='BORRADOR')throw new NotFoundException('Borrador no encontrado');
    const values=JSON.parse(row.valoresJson);this.validar(values,false);const warnings=this.advertenciasContraste(values);if(warnings.some(x=>x.critical))throw new BadRequestException(warnings.map(x=>x.message));
    await this.dataSource.transaction(async manager=>{
      const versionRepo=manager.getRepository(ConfiguracionVersion);const valueRepo=manager.getRepository(ConfiguracionValor);
      await versionRepo.update({estado:'PUBLICADO'},{estado:'ARCHIVADO'});
      for(const [clave,valor] of Object.entries(values)){
        const actual=await valueRepo.findOne({where:{clave,alcance:'GLOBAL'}});
        if(actual){actual.valorJson=JSON.stringify(valor);actual.version+=1;actual.actualizadoPor=actorId;await valueRepo.save(actual);}
        else await valueRepo.save(valueRepo.create({clave,alcance:'GLOBAL',usuarioId:null,valorJson:JSON.stringify(valor),version:1,actualizadoPor:actorId}));
      }
      row.estado='PUBLICADO';row.publicadoPor=actorId;row.publicadoEn=new Date();await versionRepo.save(row);
    });
    await this.auditoria.registrar({usuarioId:actorId,accion:'PUBLICAR',recurso:'configuracion.global',recursoId:id,datosDespues:{version:row.numero,motivo:row.motivo}});
    return this.serializarVersion(row);
  }

  async versiones(){return Promise.all((await this.versionesRepo.find({order:{numero:'DESC'},take:100})).map(x=>this.serializarVersion(x)));}
  async restaurar(id:string,motivo:string,actorId:string){
    const source=await this.versionesRepo.findOne({where:{id}});if(!source)throw new NotFoundException('Versión no encontrada');
    const existente=await this.versionesRepo.findOne({where:{estado:'BORRADOR'}});if(existente)throw new ConflictException('Existe un borrador pendiente. Publíquelo antes de restaurar una versión.');
    const max=await this.versionesRepo.createQueryBuilder('v').select('MAX(v.numero)','max').getRawOne();
    const row=await this.versionesRepo.save(this.versionesRepo.create({numero:Number(max?.max??0)+1,estado:'BORRADOR',valoresJson:source.valoresJson,motivo,baseVersion:source.numero,creadoPor:actorId,publicadoPor:null,publicadoEn:null}));
    await this.auditoria.registrar({usuarioId:actorId,accion:'RESTAURAR_VERSION',recurso:'configuracion.global',recursoId:id,datosDespues:{nuevaVersion:row.numero,motivo}});
    return this.publicar(row.id,actorId);
  }
  async exportar(){return {format:'sigbo-config',schemaVersion:1,exportedAt:new Date().toISOString(),registryVersion:'1.0',published:await this.publica()};}

  validar(values:Record<string,unknown>,soloUsuario:boolean){
    const errors:string[]=[];
    for(const [key,value] of Object.entries(values)){
      const def=CONFIG_BY_KEY.get(key);if(!def){errors.push(`Clave desconocida: ${key}`);continue;}
      if(soloUsuario&&!def.userOverride){errors.push(`${key} no admite personalización`);continue;}
      if(def.tipo==='booleano'&&typeof value!=='boolean')errors.push(`${key} debe ser booleano`);
      if(def.tipo==='texto'&&(typeof value!=='string'||value.length>2000))errors.push(`${key} debe ser texto válido`);
      if(def.tipo==='numero'&&(typeof value!=='number'||(def.min!==undefined&&value<def.min)||(def.max!==undefined&&value>def.max)))errors.push(`${key} está fuera de rango`);
      if(def.tipo==='color'&&(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value)))errors.push(`${key} debe ser color hexadecimal`);
      if(def.allowed&&!def.allowed.includes(value))errors.push(`${key} contiene un valor no permitido`);
    }
    if(errors.length)throw new BadRequestException(errors);
  }

  private toMap(rows:ConfiguracionValor[]){return new Map(rows.map(x=>[x.clave,JSON.parse(x.valorJson)]));}
  private async versionPublicada(){return this.versionesRepo.findOne({where:{estado:'PUBLICADO'},order:{numero:'DESC'}});}
  private serializarVersion(v:ConfiguracionVersion){return {...v,values:JSON.parse(v.valoresJson),valoresJson:undefined};}
  private advertenciasContraste(values:Record<string,unknown>){
    const bg=String(values['tokens.background']??CONFIG_BY_KEY.get('tokens.background')!.defaultValue),text=String(values['tokens.text']??CONFIG_BY_KEY.get('tokens.text')!.defaultValue);
    const ratio=this.contrast(bg,text);return ratio<4.5?[{key:'tokens.text',critical:true,ratio:Number(ratio.toFixed(2)),message:`El contraste texto/fondo es ${ratio.toFixed(2)}:1; WCAG AA requiere 4.5:1.`}]:[];
  }
  private contrast(a:string,b:string){const lum=(hex:string)=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return(x+.05)/(y+.05);}
}
