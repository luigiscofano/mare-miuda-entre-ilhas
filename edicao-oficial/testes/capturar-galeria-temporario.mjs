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
const desktop = { width: 1600, height: 900 };
const celular = { width: 390, height: 844 };
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

async function tela(viewport, fn) {
  const mobile = viewport === celular || viewport.emularCelular === true;
  const ctx = await browser.newContext({ viewport: {width:viewport.width,height:viewport.height}, deviceScaleFactor: 1, reducedMotion: 'reduce',
    isMobile: mobile, hasTouch: mobile });
  try {
    await ctx.route('**/*', r => r.request().url().startsWith(origem + '/') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    const erros = [];
    p.setDefaultTimeout(8_000);
    p.on('pageerror', e => erros.push(e.message));
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
  const layout = await p.evaluate(() => ({ ...Object.fromEntries(Object.entries({
    jogo:'#jogo', inicio:'#inicio', palco:'.porto-palco', rodape:'.barra-idioma', idioma:'#idioma-jogo', janela:'[aria-modal=true]:not([hidden])',
  }).map(([nome,seletor]) => {
    const el=document.querySelector(seletor);
    const r=el?.getBoundingClientRect();
    return [nome,r ? [r.left,r.top,r.right,r.bottom] : null];
  })), cantos:[...document.querySelectorAll('.porto-quinas [data-quina]')].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}),
  rochas:[...document.querySelectorAll('.porto-quinas [data-rocha]')].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}),
  fundo:getComputedStyle(document.body).backgroundColor, br:document.body.getBoundingClientRect().toJSON() }));
  const png = await p.screenshot({ animations: 'disabled', caret: 'hide', scale: 'css' });
  const path = join(saida, nome + '.png');
  await writeFile(path, png);
  lista.push({ arquivo: nome + '.png', viewport: p.viewportSize(), sha256: createHash('sha256').update(png).digest('hex'), fonte: font, layout });
  console.log('Captura real:', nome, font);
}

async function botao(p, seletor) {
  const b = p.locator(seletor);
  await b.waitFor();
  assert(await b.isEnabled(), 'O botão precisa aceitar a navegação: ' + seletor);
  await b.evaluate(e => e.click());
}

const refPorto = '#comecar .porto-rotulo';
try {
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
    await tela({ width:320, height:568, emularCelular:true }, p => arte(p, 'porto-celular-estreito-teste', refPorto));
  assert.equal(lista.length, 7);
  await writeFile(join(saida, 'capturas.json'), JSON.stringify({ buildSha256: sha, browser: browser.version(), capturas: lista }, null, 2) + '\n');
} finally { await browser.close(); await new Promise(done => servidor.close(done)); }
