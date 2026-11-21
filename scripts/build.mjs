import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
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
// O executável offline incorpora as mesmas imagens copiadas para o build servido.
const imagens = ['assets/logo-placa-de-areia-pt.png', 'assets/cabo-baixo-192.png', 'assets/arquipelago-meia-lua.png', 'assets/enseadinha-512.png', 'assets/seletor-recifes-512.png', 'assets/seletor-mangue-512.png',
  'assets/seletor-enseada-512.png', 'assets/seletor-deriva-512.png',
  'assets/seletor-grutas-512.png', 'assets/seletor-ressaca-512.png', 'assets/seletor-farol-512.png',
  'assets/fauna/spritesheet.png', 'assets/fauna/garca-patrulha.png', 'assets/fauna/garca-rasante.png'];
let htmlOffline = html;
for (const imagem of imagens) {
  const destino = join(pasta, imagem);
  await mkdir(dirname(destino), { recursive: true });
  await copyFile(imagem, destino);
  const embutida = 'data:image/png;base64,' + (await readFile(imagem)).toString('base64');
  htmlOffline = htmlOffline.replace('./' + imagem, embutida);
}
await writeFile(join(pasta, 'index.html'), html);
await writeFile(join(pasta, 'styles.css'), css);
await writeFile(join(pasta, 'mare-miuda-prototipo.html'), htmlOffline
  .replace('<link rel="stylesheet" href="./styles.css">', `<style>\n${css}</style>`)
  .replace('./src/interface/index.js', gerarUrl('src/interface/index.js')));
console.log('Build em dist/; HTML offline em dist/mare-miuda-prototipo.html');
