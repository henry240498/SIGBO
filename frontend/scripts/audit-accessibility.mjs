<<<<<<< Updated upstream
import{readFile,readdir}from'node:fs/promises';import{join}from'node:path';
const root=join(process.cwd(),'src'),files=[];async function walk(dir){for(const name of await readdir(dir,{withFileTypes:true})){const path=join(dir,name.name);name.isDirectory()?await walk(path):/\.(tsx|ts)$/.test(name.name)&&files.push(path)}}await walk(root);
let confirms=0,buttons=0;for(const file of files){const text=await readFile(file,'utf8');confirms+=(text.match(/\bconfirm\s*\(/g)||[]).length;buttons+=(text.match(/<button(?![^>]*\btype=)[^>]*>/g)||[]).length}if(confirms>31||buttons>257){console.error({confirms,buttons});process.exit(1)}console.log(`Auditoría crítica superada en ${files.length} archivos. Confirmaciones: ${confirms}; botones sin type: ${buttons}.`);
=======
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../src/app/',import.meta.url),files=[];
function walk(dir){for(const name of readdirSync(dir)){const p=join(dir,name),s=statSync(p);if(s.isDirectory())walk(p);else if(/\.(tsx|jsx)$/.test(name))files.push(p)}}
walk(root.pathname.replace(/^\/(.:\/)/,'$1'));
const rules=[
 ['HTML dinámico sin saneamiento',/dangerouslySetInnerHTML/g],
 ['tabIndex positivo',/tabIndex\s*=\s*\{?[1-9]/g],
 ['imagen sin texto alternativo',/<img\b(?![^>]*\balt=)[^>]*>/gs],
 ['nueva pestaña sin protección',/target=["']_blank["'](?![^>]*rel=["'][^"']*(?:noopener|noreferrer))/gs],
];
const errors=[];for(const file of files){const source=readFileSync(file,'utf8');for(const[label,pattern]of rules){pattern.lastIndex=0;if(pattern.test(source))errors.push(`${file}: ${label}`)}}
const source=files.map(file=>readFileSync(file,'utf8')).join('\n');
const debt={
 confirmaciones:(source.match(/(?:window\.)?confirm\s*\(/g)||[]).length,
 botonesSinTipo:(source.match(/<button\b(?![^>]*\btype=)/gs)||[]).length,
 estilosInline:(source.match(/style=\{\{/g)||[]).length,
 tiposAny:(source.match(/:\s*any\b|\bas\s+any\b|<any>/g)||[]).length,
};
const baseline={confirmaciones:23,botonesSinTipo:207,estilosInline:1636,tiposAny:85};
for(const[key,value]of Object.entries(debt))if(value>baseline[key])errors.push(`La deuda ${key} aumentó de ${baseline[key]} a ${value}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Auditoría crítica superada en ${files.length} archivos.`);console.table(debt);
>>>>>>> Stashed changes
