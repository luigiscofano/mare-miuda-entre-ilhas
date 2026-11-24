import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html', 'utf8');
const uri = /data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const entrada = html.match(/<script type="module" src="([^"]+)"><\/script>/)?.[1];
assert(entrada, 'Arquivo offline sem módulo de entrada');
const fonte = Buffer.from(entrada.split(',')[1], 'base64').toString('utf8');

function importarPor(nome) {
  const linha = fonte.split('\n').find(l => l.startsWith('import {') && l.includes(nome));
  assert(linha, nome);
  return import(linha.match(uri)[0]);
}
const { TODAS_AS_FASES } = await importarPor('TODAS_AS_FASES');
const { faseEmIngles, ligarIdioma, registrarTextosDaCampanha, traduzir } = await importarPor('ligarIdioma');
for (const fase of TODAS_AS_FASES) {
  const en = faseEmIngles(fase.id);
  assert(en, 'Falta tradução de ' + fase.id);
  for (const chave of ['nome', 'objetivo', 'ensino']) {
    assert(en[chave]?.trim(), `${fase.id}: ${chave}`);
    assert.notEqual(en[chave], fase[chave], `${fase.id}: ${chave} não foi traduzido`);
  }
}
assert.equal(new Set(TODAS_AS_FASES.map(f => faseEmIngles(f.id).nome)).size, TODAS_AS_FASES.length);
assert.equal(faseEmIngles('__fase-inexistente__'), undefined);
registrarTextosDaCampanha(TODAS_AS_FASES, (_, texto) => texto);

// A fila modela a entrega em lotes do MutationObserver. O teste executa o
// módulo empacotado, sem navegador, e cobre também as escritas do tradutor.
let observador;
let atributosObservados;
const mutacoes = [];
const publicar = registro => { if (observador) mutacoes.push(registro); };
globalThis.MutationObserver = class {
  constructor(callback) { observador = callback; }
  observe(_, opcoes) { atributosObservados = opcoes.attributeFilter; }
};
function estabilizar() {
  for (let tentativa = 0; mutacoes.length; tentativa++) {
    assert(tentativa < 20, 'O observador repetiu alterações feitas pelo tradutor');
    observador(mutacoes.splice(0));
  }
}
class Texto {
  nodeType = 3;
  constructor(valor) { this.valor = valor; }
  get nodeValue() { return this.valor; }
  set nodeValue(valor) {
    this.valor = valor;
    publicar({ type: 'characterData', target: this });
  }
}
class Elemento {
  nodeType = 1;
  atributos = new Map();
  acoes = new Map();
  childNodes = [];
  constructor(tag, texto) {
    this.tag = tag;
    if (texto !== undefined) this.textContent = texto;
  }
  getAttribute(chave) { return this.atributos.get(chave) ?? null; }
  setAttribute(chave, valor) {
    this.atributos.set(chave, valor);
    if (atributosObservados?.includes(chave)) {
      publicar({ type: 'attributes', target: this, attributeName: chave });
    }
  }
  closest(seletor) {
    const corresponde = seletor.split(',').some(chave => chave === this.tag
      || (chave.startsWith('[') && this.atributos.has(chave.slice(1, -1))));
    return corresponde ? this : this.parentElement?.closest(seletor) ?? null;
  }
  addEventListener(nome, acao) { this.acoes.set(nome, acao); }
  clicar() { this.acoes.get('click')(); }
  anexar(filho) {
    filho.parentElement = this;
    this.childNodes.push(filho);
    publicar({ type: 'childList', target: this, addedNodes: [filho] });
  }
  get textContent() { return this.childNodes.map(n => n.nodeValue ?? n.textContent).join(''); }
  set textContent(valor) {
    this.childNodes = [];
    this.anexar(new Texto(valor));
  }
}

const botoes = [new Elemento('button'), new Elemento('button')];
for (const botao of botoes) botao.setAttribute('data-idioma-jogo', '');
const mar = new Elemento('span', 'Baixa');
const aviso = new Elemento('span', 'Em 2 passos a maré sobe.');
const grade = new Elemento('pre', 'S.=#\n..C#');
grade.setAttribute('aria-label', 'Representação por símbolos do tabuleiro');
const direcao = new Elemento('button');
direcao.setAttribute('aria-label', 'Mover a equipe de siris');
const dificuldade = new Elemento('option', '2 · Animado');
dificuldade.setAttribute('value', 'Animado');
const modal = new Elemento('section');
modal.anexar(botoes[1]);
modal.anexar(dificuldade);
const raiz = new Elemento('html');
for (const no of [mar, aviso, grade, direcao, botoes[0], modal]) raiz.anexar(no);
const documento = { documentElement: raiz, querySelectorAll: () => botoes };

let redesenhos = 0;
ligarIdioma(documento, () => { redesenhos++; });
estabilizar();
assert.equal(raiz.getAttribute('lang'), 'pt-BR');
assert.equal(mar.textContent, 'Baixa');
assert(botoes.every(botao => botao.textContent === 'EN'));

botoes[0].clicar();
estabilizar();
assert.equal(raiz.getAttribute('lang'), 'en');
assert(botoes.every(botao => botao.textContent === 'PT'));
assert.equal(mar.textContent, 'Low');
assert.equal(aviso.textContent, 'The tide rises in 2 steps.');
assert.equal(grade.textContent, 'S.=#\n..C#');
assert.equal(grade.getAttribute('aria-label'), 'Symbol map of the board');
assert.equal(direcao.getAttribute('aria-label'), 'Move the crab team');
assert.equal(dificuldade.textContent, '2 · Lively');
assert.equal(dificuldade.getAttribute('value'), 'Animado');
assert.equal(traduzir(TODAS_AS_FASES[0].nome), faseEmIngles(TODAS_AS_FASES[0].id).nome);

// Situação nova durante a fase: substituição de texto, atualização do texto
// existente, mudança de ARIA e aparição de uma nova mensagem no painel.
aviso.textContent = 'Em 1 passo a maré desce.';
mar.childNodes[0].nodeValue = 'Alta';
direcao.setAttribute('aria-label', 'Nenhum movimento registrado');
const feedback = new Elemento('p', 'Pérola recolhida. A maré subiu.');
modal.anexar(feedback);
estabilizar();
assert.equal(aviso.textContent, 'The tide falls in 1 step.');
assert.equal(mar.textContent, 'High');
assert.equal(feedback.textContent, 'Pearl collected. The tide rose.');
assert.notEqual(direcao.getAttribute('aria-label'), 'Nenhum movimento registrado');

botoes[1].clicar();
estabilizar();
assert.equal(raiz.getAttribute('lang'), 'pt-BR');
assert(botoes.every(botao => botao.textContent === 'EN'));
assert.equal(mar.textContent, 'Alta');
assert.equal(aviso.textContent, 'Em 1 passo a maré desce.');
assert.equal(grade.getAttribute('aria-label'), 'Representação por símbolos do tabuleiro');
assert.equal(feedback.textContent, 'Pérola recolhida. A maré subiu.');
assert.equal(direcao.getAttribute('aria-label'), 'Nenhum movimento registrado');
assert.equal(dificuldade.getAttribute('value'), 'Animado');
assert.equal(dificuldade.textContent, '2 · Animado');
assert.equal(redesenhos, 3);
console.log(`${TODAS_AS_FASES.length} fichas em inglês, alternância PT/EN, ARIA e textos dinâmicos sem alterar valores do jogo.`);
