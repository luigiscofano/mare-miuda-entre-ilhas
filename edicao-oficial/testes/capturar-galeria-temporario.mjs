import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';

const [html, saida] = process.argv.slice(2).map(p => resolve(p));
assert(html && saida && process.env.MARE_PLAYWRIGHT, 'Uso: MARE_PLAYWRIGHT=caminho node capturar-galeria.mjs HTML saída');
const { chromium } = createRequire(import.meta.url)(process.env.MARE_PLAYWRIGHT);
const conteudo = await readFile(html);
const sha = createHash('sha256').update(conteudo).digest('hex');
const esperado = process.env.MARE_BUILD_SHA;
assert(esperado && sha === esperado, 'O HTML precisa corresponder à compilação aprovada');
const csv = conteudo.toString('utf8').match(/<script type="module" src="(data:text\/javascript;base64,[^"]+)"/)?.[1];
assert(csv, 'Entrada do HTML offline ausente');
const entrada = Buffer.from(csv.split(',')[1], 'base64').toString('utf8');
const moduloFases = entrada.split('\n').find(l => l.startsWith('import {') && l.includes('TODAS_AS_FASES')).match(/from '([^']+)'/)[1];
const { TODAS_AS_FASES } = await import(moduloFases);
const concluidas = TODAS_AS_FASES.map(fase => fase.id);
assert.equal(new Set(concluidas).size, 231);
const chave = 'mare-miuda-entre-ilhas/praia-v1';
const mundos = ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'];
const desktop = { width: 1600, height: 900 };
const celular = { width: 390, height: 844 };
const modo = process.env.MARE_CAPTURAR ?? 'tudo';
const lista = [];
const browser = await chromium.launch({ headless: true, executablePath: process.env.MARE_CHROME || undefined });
await mkdir(saida, { recursive: true });
// Só serve os bytes confirmados, dentro da máquina de teste. Não há URL pública.
const servidor = createServer((req, res) => {
  if (req.url !== '/jogo.html') { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(conteudo);
});
await new Promise((aceitar, falhar) => { servidor.once('error', falhar); servidor.listen(0, '127.0.0.1', aceitar); });
const origem = 'http://127.0.0.1:' + servidor.address().port;
const mestra = origem + '/jogo.html';

function saveArquipelago() {
  // Progresso sintético só para mostrar todos os mundos. O perfil do usuário não é carregado.
  return { versao: 1, progresso: { mundo: 'arquipelago', posicao: { coluna: 1, linha: 3 },
    concluidas, viuTutorial: true }, audio: { musica: 0, efeitos: 0 } };
}

async function tela(viewport, fn, save = undefined) {
  const mobile = viewport === celular;
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce',
    isMobile: mobile, hasTouch: mobile });
  try {
    await ctx.route('**/*', r => r.request().url().startsWith(origem + '/') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    const erros = [];
    p.setDefaultTimeout(8_000);
    p.on('pageerror', e => erros.push(e.message));
    if (save) await p.addInitScript(({ chave, save }) => localStorage.setItem(chave, JSON.stringify(save)), { chave, save });
    await p.goto(mestra, { waitUntil: 'load', timeout: 90_000 });
    await p.locator('#comecar').waitFor();
    await p.evaluate(() => document.fonts.ready);
    await fn(p);
    assert.deepEqual(erros, [], 'Erros no carregamento do jogo');
  } finally { await ctx.close(); }
}

async function arte(p, nome, verificacao) {
  const indicador = p.locator(verificacao).first();
  await indicador.waitFor({ state: 'visible' });
  const font = await indicador.evaluate(e => getComputedStyle(e).fontFamily);
  assert.match(font, /system-ui/, nome + ': texto funcional deve usar a fonte de leitura');
  // Clique programático aciona a UI real sem manter um cursor ou um estado de hover no cartão.
  await p.evaluate(async () => {
    await document.fonts.ready;
    document.activeElement?.blur();
    await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
  const png = await p.screenshot({ animations: 'disabled', caret: 'hide', scale: 'css' });
  const path = join(saida, nome + '.png');
  await writeFile(path, png);
  lista.push({ arquivo: nome + '.png', viewport: p.viewportSize(), sha256: createHash('sha256').update(png).digest('hex'), fonte: font });
  console.log('Captura real:', nome, font);
}

async function botao(p, seletor) {
  const b = p.locator(seletor);
  await b.waitFor();
  assert(await b.isEnabled(), 'O botão precisa aceitar a navegação: ' + seletor);
  await b.evaluate(e => e.click());
}

const refPorto = '#comecar .porto-rotulo';
const refHub = '#cartoes-arquipelago .hub-inicio .hub-rotulo-normal';
const refSeletor = '#seletor-fases .praia-direta-card .praia-direta-nome';
try {
  if (modo === 'porto') {
    await tela(desktop, p => arte(p, 'porto', refPorto));
  } else {
    await tela(desktop, async p => {
      await arte(p, 'porto', refPorto);
      for (const [nome, seletor, checar, fechar] of [
        ['ilha-de-improviso', '#abrir-mare-a-mao', '#gerar-mare-a-mao', '#voltar-mare-a-mao'],
        ['som-e-musica', '#abrir-som-inicio', '#configuracao-jogo .painel-acao', '#fechar-som-inicio'],
        ['creditos', '#creditos-inicio', '#creditos .painel-acao', '#voltar-creditos'],
      ]) {
        await botao(p, seletor);
        await arte(p, nome, checar);
        await botao(p, fechar);
        await p.locator('[aria-modal=true]:visible').waitFor({ state: 'hidden' });
      }
      await botao(p, '#idioma-jogo');
      assert.equal(await p.locator('#idioma-jogo').textContent(), 'PT');
      await arte(p, 'troca-de-idioma', '#idioma-jogo');
    });
    await tela(celular, p => arte(p, 'porto-celular', refPorto));
    await tela(desktop, async p => {
      await botao(p, '#comecar');
      for (let i = 1; i <= 4; ++i) {
        await p.locator(`[data-pagina-hub-visual="${i}"]`).waitFor();
        await arte(p, 'arquipelago-' + i, refHub);
        if (i < 4) await botao(p, '[data-pagina-hub="proxima"]');
      }
      for (let i = 0; i < 3; ++i) await botao(p, '[data-pagina-hub="anterior"]');
      // Voltar pelo próprio controle da seleção mantém o Chromium carregado entre mundos.
      for (const [i, mundo] of mundos.entries()) {
        const alvo = `button[data-regiao="${mundo}"]`;
        const esperada = String(1 + Math.floor(i / 2));
        for (let viradas = 0; viradas < 4 && !await p.locator(alvo).isVisible(); ++viradas) {
          const atual = await p.locator('[data-pagina-hub-visual]').getAttribute('data-pagina-hub-visual');
          assert.notEqual(atual, esperada, 'Carta não encontrada na página do mundo: ' + mundo);
          await botao(p, `[data-pagina-hub="${Number(atual) < Number(esperada) ? 'proxima' : 'anterior'}"]`);
        }
        await botao(p, alvo);
        await p.locator(`#seletor-fases[data-tema="${mundo}"]`).waitFor();
        await arte(p, 'seletor-' + String(i+1).padStart(2, '0'), refSeletor);
        if (i < mundos.length - 1) {
          await botao(p, '#menu-praia');
          await botao(p, '#comecar');
        }
      }
    }, saveArquipelago());
    await tela(celular, async p => {
      await botao(p, '#comecar');
      await arte(p, 'arquipelago-celular', refHub);
    }, saveArquipelago());
  }
  assert.equal(lista.length, modo === 'porto' ? 1 : 19);
  await writeFile(join(saida, 'capturas.json'), JSON.stringify({ buildSha256: sha, browser: browser.version(), capturas: lista }, null, 2) + '\n');
} finally { await browser.close(); await new Promise(done => servidor.close(done)); }
