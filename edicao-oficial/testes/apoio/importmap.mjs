import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

export function lerModulosOffline(html) {
  const mapa = html.match(/<script type="importmap">([^<]+)<\/script>/)?.[1];
  assert(mapa, 'A edição offline precisa expor o importmap.');
  const { imports } = JSON.parse(mapa);
  const fonte = nome => {
    const uri = imports[nome];
    assert(uri?.startsWith('data:text/javascript;base64,'), nome);
    return Buffer.from(uri.split(',')[1], 'base64').toString('utf8');
  };
  const nomeValido = /^mare\/src\/[a-z0-9_/-]+\.mjs$/;
  const raiz = mkdtempSync(join(tmpdir(), 'mare-modulos-'));
  process.once('exit', () => rmSync(raiz, { force: true, recursive: true }));
  const arquivo = nome => {
    assert.match(nome, nomeValido);
    return join(raiz, nome);
  };
  const gravados = new Set();
  function escrever(nome) {
    const destino = arquivo(nome);
    if (gravados.has(nome)) return destino;
    gravados.add(nome);
    // O Node não lê importmaps HTML. Resolvemos os mesmos módulos em
    // arquivos temporários, sem recodificar a árvore ou executar o app.
    const texto = fonte(nome).replace(/'((?:mare\/src\/)[a-z0-9_/-]+\.mjs)'/g, (_, dependencia) => {
      assert(Object.hasOwn(imports, dependencia), dependencia);
      return JSON.stringify('./' + relative(dirname(destino), escrever(dependencia)).replaceAll('\\', '/'));
    });
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, texto);
    return destino;
  }
  const nomeDaEntrada = 'mare/src/app.mjs';
  const encontrar = (busca, em = nomeDaEntrada) => {
    const linha = fonte(em).split('\n').find(l => l.startsWith('import {') && l.includes(busca));
    const nome = linha?.match(/'(mare\/[^']+)'/)?.[1];
    assert(nome, busca);
    return nome;
  };
  return {
    entrada: fonte(nomeDaEntrada),
    encontrar,
    importarPor: (busca, em) => import(pathToFileURL(escrever(encontrar(busca, em))).href),
  };
}
