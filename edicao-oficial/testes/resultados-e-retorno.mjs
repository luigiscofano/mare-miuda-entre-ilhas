import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(process.argv[2]??'dist/mare-miuda-prototipo.html','utf8');
const url=/data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const entrada=Buffer.from(html.match(url)[0].split(',')[1],'base64').toString('utf8');
const importar=(nome)=>{
 const linha=entrada.split('\n').find(l=>l.startsWith('import {')&&l.includes(nome));
 assert(linha,nome);
 return import(linha.match(url)[0]);
};
const {quadroDoRetornoDaMare,pausaParaRecuperacao}=await importar('quadroDoRetornoDaMare');
const {quadroDoResultado}=await importar('quadroDoResultado');
const {DURACAO_DO_BOTE_DA_GARCA}=await importar('DURACAO_DO_BOTE_DA_GARCA');

const {CADENCIA_DA_MARE,AVANCO_DA_MARE,criarViradaDirecional,quadroDaViradaDirecional}=await importar('criarViradaDirecional');
assert.equal(CADENCIA_DA_MARE,30);
assert.equal(AVANCO_DA_MARE,3);
const mapa=['S=.C','.###'];
const subida=criarViradaDirecional(mapa,0,true);
const descida=criarViradaDirecional(mapa,0,false);
assert.equal(subida.duracao,descida.duracao);
assert.equal(subida.duracao*24,subida.duracaoNoRitmoAnterior*30);
for(let degrau=1;degrau<subida.total;degrau++){
 const t=degrau*30;
 assert.equal(quadroDaViradaDirecional(subida,t-1).limiar,(degrau-1)*3-1);
 assert.equal(quadroDaViradaDirecional(subida,t).limiar,quadroDaViradaDirecional(descida,subida.duracao-t).limiar);
}
const levada=criarViradaDirecional(mapa,0,true,undefined,true);
assert.equal(levada.duracao,300);
assert.equal(levada.duracaoNoRitmoAnterior,240);
assert.equal(quadroDaViradaDirecional(levada,299).limiar,levada.g.maximo);
assert.equal(quadroDaViradaDirecional(levada,300),undefined);
assert.equal(pausaParaRecuperacao(true,300,true,240),1100);
assert.equal(pausaParaRecuperacao(true,368,true),1296);

const inicio=1000;
function pulso(t,anterior=false){
 const q=quadroDoRetornoDaMare({inicio,indices:[1],pulsoAnterior:anterior},inicio+t);
 return q?.indices.includes(1)?q.tom:undefined;
}
assert.deepEqual([0,99,100,165,166,269,270,335,336,449,450,495,496].map(t=>pulso(t)),
 [0,0,undefined,undefined,1,1,undefined,undefined,0,0,undefined,undefined,undefined]);
assert.deepEqual([0,19,20,64,65,95,96,131,132,151,152,196,197,227,228].map(t=>pulso(t,true)),
 [0,0,1,1,0,0,undefined,undefined,0,0,1,1,0,0,undefined]);
for(const duracao of [0,240,368,504,1608]){
 assert.equal(pausaParaRecuperacao(true,duracao,true),2*(duracao+280));
 assert.equal(pausaParaRecuperacao(true,duracao,false),528);
 assert.equal(pausaParaRecuperacao(false,duracao,true),264);
 assert.equal(pausaParaRecuperacao(false,duracao,false),264);
}
assert.equal(DURACAO_DO_BOTE_DA_GARCA,368);
const d={tipo:'derrota',siris:[],alvos:[],causa:['mare']};
assert.equal(quadroDoResultado(d,100,false).placa,undefined);
assert.equal(quadroDoResultado(d,560,false).placa,true);
assert.notEqual(quadroDoResultado(d,560,false).ate,Infinity);
assert.equal(quadroDoResultado(d,793,false).ate,Infinity);
const q=quadroDoResultado({tipo:'derrota'},0,false,true);
assert(q.placa&&q.ate===Infinity);

const fun=entrada.slice(entrada.indexOf('function geometriaDaPlaca('),entrada.indexOf('function apresentarTravessia()'));
assert(fun.length>0&&fun.length<2500);
const {geometriaDaPlaca}=await import('data:text/javascript;base64,'+Buffer.from(fun+'\nexport {geometriaDaPlaca};').toString('base64'));
const perfis=[[1200,808,1],[896,676,1],[320,328,1],[320,328,2],[360,500,3],[390,604,2],[390,604,3],[430,630,3],[192,270,1]];
for(const [w,h,dpr] of perfis){
 const g=geometriaDaPlaca(w,h,dpr);
 assert(g.x>=0&&g.y>=0&&g.x+g.w<=w+1e-5&&g.y+g.h<=h+1e-5);
 assert(Math.abs((w-g.w)/2-g.x)<=1/dpr&&Math.abs((h-g.h)/2-g.y)<=1/dpr);
 if(w*dpr>=248)assert(Number.isInteger(g.fator)&&g.fator>=1);
}
console.log('9 geometrias, placa normal/reduzida, curva de três pulsos e curva anterior do Improviso: OK.');
