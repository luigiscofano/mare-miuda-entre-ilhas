import { lerModulosOffline } from './apoio/importmap.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html', 'utf8');
const { entrada: fonte, importarPor } = lerModulosOffline(html);
const { conectarDeslizeNoTabuleiro } = await importarPor('conectarDeslizeNoTabuleiro');
assert(!html.includes('id="direcoes-da-fase"'));
assert(!/data-direcao="(?:cima|baixo|esquerda|direita)"/.test(html));
assert(fonte.includes("conectarDeslizeNoTabuleiro(buscar('#moldura'), window, mover,"));

class Tabuleiro extends EventTarget {
  capturado = null;
  setPointerCapture(id) { this.capturado = id; }
  hasPointerCapture(id) { return this.capturado === id; }
  releasePointerCapture(id) {
    assert.equal(this.capturado, id);
    this.capturado = null;
  }
}
const tabuleiro = new Tabuleiro(), janela = new EventTarget(), movimentos = [];
let habilitado = true;
const cancelar = conectarDeslizeNoTabuleiro(tabuleiro, janela, direcao => movimentos.push(direcao), () => habilitado);
const primeiro = { pointerId: 1, pointerType: 'touch', button: 0, isPrimary: true, clientX: 100, clientY: 100 };
function emitir(alvo, tipo, props = {}) {
  alvo.dispatchEvent(Object.assign(new Event(tipo), primeiro, props));
}
const abaixar = (props) => emitir(tabuleiro, 'pointerdown', props);
const soltar = (x,y) => emitir(tabuleiro, 'pointerup', { clientX: x, clientY: y });
for (const [x,y] of [[166,101],[38,101],[102,31],[102,168]]) { abaixar(); soltar(x,y); }
assert.deepEqual(movimentos, ['direita','esquerda','cima','baixo']);
abaixar(); soltar(111,109);
abaixar(); soltar(145,145);
abaixar({ pointerType: 'mouse' }); soltar(163,100);
abaixar(); emitir(tabuleiro,'pointercancel'); soltar(163,100);
abaixar(); emitir(tabuleiro,'lostpointercapture'); soltar(163,100);
abaixar(); emitir(janela,'pointerdown',{pointerId:2,isPrimary:false}); soltar(163,100);
abaixar(); cancelar(); soltar(163,100);
abaixar(); emitir(janela,'blur'); soltar(163,100);
abaixar(); habilitado = false; soltar(163,100);
abaixar(); habilitado = true; soltar(163,100);
assert.equal(movimentos.length, 4, 'Não deve disparar gesto inválido ou durante interrupção');
abaixar(); soltar(163,100); soltar(163,100);
assert.equal(movimentos.length, 5, 'Um gesto deve produzir somente um comando');
assert.equal(tabuleiro.capturado, null);
console.log('Deslize nas quatro direções, gesto curto ou diagonal, segundo dedo, cancelamento e bloqueio: OK.');
