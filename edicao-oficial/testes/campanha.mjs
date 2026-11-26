import { lerModulosOffline } from './apoio/importmap.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arquivo = process.argv[2] ?? 'dist/mare-miuda-prototipo.html';
const html = readFileSync(arquivo, 'utf8');
const { importarPor } = lerModulosOffline(html);
const { TODAS_AS_FASES } = await importarPor('TODAS_AS_FASES');
const { executarPasso, iniciar, mareAlta } = await importarPor('executarPasso');
const { paginaDaFase } = await importarPor('paginaDaFase');
const mundos = ['praia','recifes','mangue','enseada','deriva','grutas','ressaca','farol'];
assert.equal(TODAS_AS_FASES.length, 231);
assert.equal(new Set(TODAS_AS_FASES.map(f => f.id)).size, 231);
let comandos = 0;
for (const fase of TODAS_AS_FASES) {
  assert.equal(mundos.filter(m => paginaDaFase(m, fase.id)!==undefined).length,1,fase.id);
  // Um ID antigo pode persistir em um save; as regras vêm da ficha atual.
  const chavesVigentes = new Set(['id','nome','mapa','objetivo','ensino','solucao','ameaca','dupla','fendas']);
  for (const chave of Object.keys(fase)) assert(chavesVigentes.has(chave), fase.id + ': ' + chave);
  assert(fase.mapa.every(linha => /^[S.=#CBGHATMY]+$/.test(linha)), fase.id);
  let estado = iniciar(fase), viuAlta = false;
  for (const acao of fase.solucao) {
    const antes = estado;
    estado = executarPasso(fase, estado, acao).estado;
    assert.equal(estado.passos, antes.passos + 1, fase.id);
    assert.equal(estado.levadas, 0, fase.id);
    viuAlta ||= mareAlta(estado.passos);
    comandos++;
  }
  assert(viuAlta, fase.id);
  assert.equal(estado.situacao, 'vitoria', fase.id);
}
console.log(`231 soluções completas, ${comandos} comandos, sem levadas.`);
