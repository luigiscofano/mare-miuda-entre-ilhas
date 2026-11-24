import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html', 'utf8');
const uri = /data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const entrada = Buffer.from(html.match(uri)[0].split(',')[1], 'base64').toString('utf8');
const modulo = entrada.split('\n').find(linha => linha.startsWith('import { criarPaineisDeApoio }')).match(uri)[0];
const { criarPaineisDeApoio } = await import(modulo);

assert.match(html, /background:rgb\(9 30 39 \/ 79%\)/);
assert.equal((html.match(/class="painel-brilhos" aria-hidden="true"/g) ?? []).length, 3);
assert.match(html, /\.painel-brilhos\s*\{[^}]*pointer-events:none/);
assert.match(html, /@media \(forced-colors:active\) \{\s*\.painel-brilhos \{display:none\}/);

assert.match(html, /id="bancada" hidden tabindex="-1"/);
assert.match(html, /id="mare-a-mao"[^>]+role="dialog"[^>]+aria-modal="true"/);
assert.match(html, /type="submit" id="gerar-mare-a-mao" form="configurar-mare-a-mao"/);
assert.match(html, /id="creditos"[^>]+role="dialog"[^>]+aria-modal="true"/);
assert.match(html, /id="configuracao-jogo"[^>]+role="dialog"[^>]+aria-modal="true"/);
assert.match(html, /id="trilha-no-painel"[^>]+hidden/);
assert(!html.match(/id="trilha-no-painel"[\s\S]*?<img[^>]+viol[aã]o/i),'Sem ilustração de violão no cartão');
assert.equal((html.match(/type="range" min="0" max="100" step="1"/g) ?? []).length,2);

const documento = {};
function elemento() {
  const atributos = new Map();
  const ouvintes = new Map();
  return {
    hidden: false, scrollTop: 78, children: [], ordem: [],
    hasAttribute: nome => atributos.has(nome),
    getAttribute: nome => atributos.get(nome),
    setAttribute: (nome, valor) => atributos.set(nome, valor),
    removeAttribute: nome => atributos.delete(nome),
    addEventListener: (nome, fn) => ouvintes.set(nome, fn),
    disparar: (nome, detalhe) => ouvintes.get(nome)?.(detalhe),
    querySelector() { return this.conteudo; },
    querySelectorAll() { return this.ordem; },
    closest(seletor) { return seletor === 'details' ? this.detalhes : this.hidden ? this : null; },
    focus() { documento.activeElement = this; },
  };
}
const [jogo, corpo, fundo, inicio, fase, som, creditos, abrirSom, abrirCreditos, x, volume, fechar] =
  Array.from({ length:12 }, elemento);
jogo.children = [inicio, fase, fundo, som, creditos];
fase.setAttribute('inert', '');
som.ordem = [x, volume, fechar];
som.conteudo = elemento();
som.hidden = creditos.hidden = fundo.hidden = true;
let destino;
const paineis = criarPaineisDeApoio({ jogo, corpo, fundo, documento });
const tecla = (key, shiftKey = false) => {
  const evento = { key, shiftKey, preventDefault(){this.cancelou=true;}, stopPropagation(){this.parou=true;} };
  jogo.disparar('keydown', evento);
  return evento;
};

paineis.abrir({ painel:som, abertura:abrirSom, foco:volume });
assert(paineis.aberto());
assert(!fundo.hidden && !som.hidden && creditos.hidden);
assert.equal(corpo.getAttribute('data-painel-apoio-aberto'),'');
assert.equal(abrirSom.getAttribute('aria-expanded'),'true');
assert(inicio.hasAttribute('inert'));
assert.equal(documento.activeElement,volume);
assert.equal(som.conteudo.scrollTop,0);

fechar.focus();
assert(tecla('Tab').cancelou);
assert.equal(documento.activeElement,x);
assert(tecla('Tab',true).cancelou);
assert.equal(documento.activeElement,fechar);
assert(tecla('Escape').parou);
assert(!paineis.aberto());
assert(fundo.hidden && som.hidden);
assert(!inicio.hasAttribute('inert'));
assert(fase.hasAttribute('inert'),'Não remover um bloqueio anterior');
assert.equal(documento.activeElement,abrirSom);

paineis.abrir({ painel:som, abertura:abrirSom, foco:volume, aoFechar:() => assert.fail('Troca reentrante não notifica destino antigo') });
paineis.abrir({ painel:creditos, abertura:abrirCreditos, foco:x, aoFechar:() => { destino='mapa'; } });
assert(som.hidden && !creditos.hidden && !fundo.hidden);
assert.equal(abrirSom.getAttribute('aria-expanded'),'false');
assert.equal(abrirCreditos.getAttribute('aria-expanded'),'true');
fundo.disparar('click');
assert.equal(destino,'mapa');
assert.equal(abrirCreditos.getAttribute('aria-expanded'),'false');
assert(fundo.hidden && creditos.hidden);
assert(!corpo.hasAttribute('data-painel-apoio-aberto'));
const [ilha, abrirIlha, detalhes, resumo, repetir] = Array.from({length:5}, elemento);
jogo.children.push(ilha);
ilha.hidden = true;
ilha.ordem = [resumo, repetir];
detalhes.open = false;
detalhes.conteudo = resumo;
resumo.detalhes = repetir.detalhes = detalhes;
paineis.abrir({ painel:ilha, abertura:abrirIlha, foco:x });
assert.equal(abrirIlha.getAttribute('aria-expanded'),'true');
assert(tecla('Tab',true).cancelou);
assert.equal(documento.activeElement,resumo,'Histórico recolhido deixa apenas o resumo no ciclo');
detalhes.open = true;
assert(tecla('Tab',true).cancelou);
assert.equal(documento.activeElement,repetir,'Histórico aberto permite navegar para repetir uma travessia');
fundo.disparar('click');
assert.equal(documento.activeElement,abrirIlha);
assert(ilha.hidden && fundo.hidden);
console.log('Fundo comum 79%, brilhos decorativos, modalidade, foco, histórico da Ilha e retorno do desfecho: OK.');
