import{BadRequestException}from'@nestjs/common';import{ServiciosService}from'./servicios.service';
const service=new ServiciosService({}as never,{}as never,{}as never,{}as never,{}as never,{}as never,{}as never,{}as never);
const validar=(formulario:Record<string,unknown>)=>(service as unknown as{validarCoordenadas:(f:Record<string,unknown>)=>void}).validarCoordenadas(formulario);
describe('Geolocalización de servicios',()=>{it('acepta un par válido',()=>expect(()=>validar({coordenadasLat:-25.347,coordenadasLon:-57.19})).not.toThrow());it('exige ambas coordenadas',()=>expect(()=>validar({coordenadasLat:-25.347})).toThrow(BadRequestException));it('rechaza coordenadas fuera del planeta',()=>expect(()=>validar({coordenadasLat:-125,coordenadasLon:-57})).toThrow(BadRequestException))});
