import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({schema:'contenido',name:'publicaciones'})
export class Publicacion {
 @PrimaryColumn('uniqueidentifier') id:string;
 @Column({length:30}) seccion:string;
 @Column({length:20}) estado:string;
 @Column({default:true}) visible:boolean;
 @Column({default:false}) destacada:boolean;
 @Column({type:'int',default:0}) orden:number;
 @Column({type:'date',nullable:true}) fecha:string|null;
 @Column({name:'publicar_en',type:'datetimeoffset',nullable:true}) publicarEn:Date|null;
 @Column({name:'caducar_en',type:'datetimeoffset',nullable:true}) caducarEn:Date|null;
 @Column({name:'contenido_json',type:'nvarchar',length:'MAX'}) contenidoJson:string;
 @Column({name:'creado_en',type:'datetimeoffset',select:false,insert:false,update:false}) creadoEn:Date;
 @Column({name:'actualizado_en',type:'datetimeoffset',select:false,insert:false,update:false}) actualizadoEn:Date;
}
