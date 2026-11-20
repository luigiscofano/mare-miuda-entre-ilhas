import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { dirname, join, posix, sep } from 'node:path';

const pasta = 'dist';
const modulos = new Map();

async function compilarFontes(caminho) {
  const itens = await readdir(caminho, { withFileTypes: true });
  for (const item of itens) {
    const origem = join(caminho, item.name);
    if (item.isDirectory()) await compilarFontes(origem);
    else if (item.name.endsWith('.ts')) {
      const nome = origem.split(sep).join("/").replace(/\.ts$/, '.js');
      const fonte = await readFile(origem, 'utf8');
      const js = stripTypeScriptTypes(fonte).replace(/(from ['"][^'"]+)\.ts(['"])/g, '$1.js$2');
      modulos.set(nome, js);
      const destino = join(pasta, nome);
      await mkdir(dirname(destino), { recursive: true });
      await writeFile(destino, js);
    }
  }
}

// A versão de teste abre por file:// sem servidor, CDN ou instalação.
// URLs de módulo idênticas são reutilizadas mesmo com múltiplas importações.
const urls = new Map();
function gerarUrl(nome, encadeamento = new Set()) {
  if (urls.has(nome)) return urls.get(nome);
  const modulo = modulos.get(nome);
  if (!modulo || encadeamento.has(nome)) throw new Error(`Módulo ausente ou cíclico: ${nome}`);
  const visitados = new Set([...encadeamento, nome]);
  const js = modulo.replace(/(from ['"])(\.\.?\/[^'"]+)(['"])/g, (_match, inicio, relativo, fim) => {
    const resolvido = posix.normalize(posix.join(posix.dirname(nome), relativo));
    return inicio + gerarUrl(resolvido, visitados) + fim;
  });
  const url = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  urls.set(nome, url);
  return url;
}

await mkdir(pasta, { recursive: true });
await compilarFontes('src');
const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');
await writeFile(join(pasta, 'index.html'), html);
await writeFile(join(pasta, 'styles.css'), css);
await writeFile(join(pasta, 'mare-miuda-prototipo.html'), html
  .replace('<link rel="stylesheet" href="./styles.css">', `<style>\n${css}</style>`)
  .replace('./src/interface/index.js', gerarUrl('src/interface/index.js')));
console.log('Build em dist/; HTML offline em dist/mare-miuda-prototipo.html');
