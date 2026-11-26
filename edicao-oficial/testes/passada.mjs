import { lerModulosOffline } from './apoio/importmap.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Exercita a animação carregada pelo navegador, não uma cópia do algoritmo.
const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html','utf8');
const { importarPor } = lerModulosOffline(html);
const { posesDaPassada, proximaPoseDaPassada, DURACAO_DA_PASSADA } = await importarPor('posesDaPassada');
assert.equal(DURACAO_DA_PASSADA,205);
for(const [campanha,janela,a,b] of [[true,205,66,136],[false,165,53,109]]) {
 for (const [dx,dy] of [[48,0],[-48,0],[0,48],[0,-48]]) {
  const corpo = {dx,dy};
  for(const t of [0,30,a,80,b,150,janela-1]) {
   const [solo, ausente, dupla] = posesDaPassada([corpo,undefined,corpo],t,campanha);
   assert.deepEqual(solo,dupla);
   assert.equal(ausente,undefined);
   assert.equal(solo.dx,Math.round(dx*(1-t/janela)));
   assert.equal(solo.dy,Math.round(dy*(1-t/janela)));
   assert.equal(solo.alternancia,t<a||t>=b?1:-1);
   assert(proximaPoseDaPassada(t,campanha)>t);
   assert(proximaPoseDaPassada(t,campanha)-t<=1000/60+1e-6);
  }
  assert.deepEqual(posesDaPassada([corpo],janela,campanha),[]);
 }
 assert.equal(proximaPoseDaPassada(janela,campanha),undefined);
}
console.log('Passada de 205 ms na campanha e 165 ms fora dela nas quatro direções, em grade inteira.');
