import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Exercita a animação carregada pelo navegador, não uma cópia do algoritmo.
const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html','utf8');
const uri = /data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const entrada = Buffer.from(html.match(uri)[0].split(',')[1], 'base64').toString('utf8');
const linha = entrada.split('\n').find(l => l.startsWith('import {') && l.includes('posesDaPassada'));
const { posesDaPassada, proximaPoseDaPassada } = await import(linha.match(uri)[0]);
for (const [dx,dy] of [[48,0],[-48,0],[0,48],[0,-48]]) {
  const corpo = {dx,dy};
  for(const t of [0,30,53,80,109,150,164]) {
    const [solo, ausente, dupla] = posesDaPassada([corpo,undefined,corpo],t);
    assert.deepEqual(solo,dupla);
    assert.equal(ausente,undefined);
    assert.equal(solo.dx,Math.round(dx*(1-t/165)));
    assert.equal(solo.dy,Math.round(dy*(1-t/165)));
    assert.equal(solo.alternancia,t<53||t>=109?1:-1);
    assert(proximaPoseDaPassada(t)>t);
    assert(proximaPoseDaPassada(t)-t<=1000/60+1e-6);
  }
  assert.deepEqual(posesDaPassada([corpo],165),[]);
}
assert.equal(proximaPoseDaPassada(165),undefined);
console.log('Passada de 165 ms nas quatro direções, em grade inteira.');
