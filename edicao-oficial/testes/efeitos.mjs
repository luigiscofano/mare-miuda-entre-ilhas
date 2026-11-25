import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html', 'utf8');
const uri = /data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const textoDaUri = url => Buffer.from(url.split(',')[1], 'base64').toString('utf8');
const entrada = textoDaUri(html.match(uri)[0]);
const controlador = entrada.split('\n').find(linha => linha.startsWith('import { criarAudio, ativouBotao }')).match(uri)[0];
const { criarAudio, ativouBotao } = await import(controlador);
const recibos = {
  cavar: '1a96bf2c210507c3104363ad5decf6c0b50e91d581e6f159887d6c2f6a4e6745',
  'clique-botao': 'c7ce544a16c37f1931cfea6b7b4aef65efaa587f9a6228ba5910da1837695132',
  derrota: '8ec85c9e0da3a18c44b4350f93c29f68904e2d7fd4c1b6e27cf7514d151302c4',
  garca: '95fe2b15c00fb8e86f7827dd7f97790360b183f12efd8e84a28679cbc5bdd439',
  levada: 'a8f9a755c3e4344a59f11164cc0d684e76bf6bc311276d1476ba9c513c92539d',
  'mare-descendo': '12d6b34d315d45cc0f550a6faf44715746cad54e81572bcaf90ecd55d17ff710',
  'mare-subindo': '3196f5dc4dc9bd6dd48de442322dca17fdb1712498132801b7904680f24898aa',
  'passo-areia': 'db526b4a68475d8e51d4de7cd1e7320c886170332ddf74decc69bd81f2cbe601',
  perola: '3e6ab9a62b24d1cb6530beacb8942c73f1c099b7e2b15c8f4035e56a42e355ab',
  retorno: '2297d969af88f8f9f3c8a0f9da0dad71a5afa5af2e9b5a5e66bc8cfe6bb7ff2a',
  'sair-fenda': '586988bbf44939d96ea76d8c315641f1d1d2cf86ef66e7ef9c56f3475b9a460b',
  vitoria: 'adee088f6d0b22f954e9cedd458e088691b9397ffe960f89385e88d4d08d0037',
};
const faixas = new Map([...html.matchAll(/id="efeito-offline-([a-z-]+)">([A-Za-z0-9+/=]+)<\/script>/g)]
  .map(([,nome, b64]) => [nome,b64]));
assert.deepEqual([...faixas.keys()].sort(), Object.keys(recibos).sort());
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [nome, b64] of faixas) {
  const wav = Buffer.from(b64, 'base64');
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(hash(wav), recibos[nome], nome);
}

const fonteAprovada = new Map(Object.entries(recibos).map(([nome,sha]) => [sha,nome]));
const pista = html.match(/id="trilha-offline-violao">([A-Za-z0-9+/=]+)<\/script>/)[1];
fonteAprovada.set('d74670604f0f39e99d0390e76772c865486f898358800d71f4d28173dea36bf6', 'MÚSICA');
let instantes = 0;
let liberarClique;

class Ganho {
  gain = {
    value: 1,
    setTargetAtTime(valor) { this.value=valor; },
    setValueAtTime() {},
    linearRampToValueAtTime() {},
  };
  connect() {}
  disconnect() {}
}
class Contexto extends EventTarget {
  static atual;
  state = 'suspended';
  currentTime = 1;
  destination = {};
  fontes = [];
  ganhos = [];
  constructor() { super(); Contexto.atual=this; }
  createGain() {
    const ganho = new Ganho();
    this.ganhos.push(ganho);
    return ganho;
  }
  createBufferSource() {
    const fonte = {
      connect(no) { this.canal = no; },
      disconnect() { this.canal = null; },
      start(instante) { this.iniciou = instante; },
      stop() { this.parou = true; },
    };
    this.fontes.push(fonte);
    return fonte;
  }
  createOscillator() { assert.fail('Não deve duplicar o novo WAV com o bipe antigo.'); }
  decodeAudioData(dados) {
    const nome = fonteAprovada.get(hash(Buffer.from(dados)));
    assert(nome);
    const buffer = { nome, sampleRate:48000, length:2048000 };
    if (nome !== 'clique-botao') return Promise.resolve(buffer);
    return new Promise(resolve => { liberarClique = () => resolve(buffer); });
  }
  async resume() { this.state='running'; this.dispatchEvent(new Event('statechange')); }
}
globalThis.AudioContext = Contexto;
globalThis.document = { querySelector: seletor => {
  const b64 = seletor==='#trilha-offline-violao' ? pista : faixas.get(seletor.replace('#efeito-offline-',''));
  return b64 ? { textContent:b64 } : null;
} };
Object.defineProperty(globalThis, 'performance', { value:{ now:() => instantes } });

const alterar = new Set();
const botao = {
  matches: () => alterar.has('disabled'),
  closest: () => alterar.has('oculto') || alterar.has('aria-disabled') ? {} : null,
};
const alvo = { closest: tipo => tipo ==='button' ? botao : null };
const clique = (type='click', isTrusted=true, target=alvo) => ({type,isTrusted,target});

assert(ativouBotao(clique()));
assert(!ativouBotao(clique('pointerenter')));
assert(!ativouBotao(clique('pointerdown')));
assert(!ativouBotao(clique('click', false)));
assert(!ativouBotao(clique('click', true, {})));
for (const estado of ['disabled','oculto','aria-disabled']) {
  alterar.add(estado);
  assert(!ativouBotao(clique()),estado);
  alterar.delete(estado);
}

const audio = criarAudio();
audio.ambiente(true);
const aguardar = () => new Promise(resolve => setImmediate(resolve));
await audio.habilitar();
await aguardar();
const ctx = Contexto.atual;
assert(ctx);
const [musica, efeitos] = ctx.ganhos;
const tocarados = () => ctx.fontes.map(f => f.buffer.nome);
assert.deepEqual(tocarados(), ['MÚSICA']);
assert(ctx.fontes[0].loop);

// O primeiro clique que abriu a tela pode ser anterior à decodificação do WAV.
audio.clique();
audio.limparEfeitosDaCena();
assert.deepEqual(tocarados(), ['MÚSICA']);
instantes=50;
liberarClique();
await aguardar();
assert.deepEqual(tocarados(), ['MÚSICA','clique-botao']);
assert.equal(ctx.fontes.at(-1).canal, efeitos);
audio.limparEfeitosDaCena();
assert(!ctx.fontes.at(-1).parou);
audio.clique();
assert.deepEqual(tocarados(), ['MÚSICA','clique-botao','clique-botao']);

audio.volumes({ musica:0, efeitos:.55 });
audio.eventos([{tipo:'virada',alta:true},{tipo:'fragmento'},{tipo:'levada'},{tipo:'vitoria'},{tipo:'virada',alta:false}]);
assert.deepEqual(tocarados().slice(-4), ['mare-subindo','perola','vitoria','mare-descendo']);
assert(ctx.fontes.slice(-4).every(f => f.canal===efeitos && !f.loop));
audio.efeito('passo-areia',187,.19);
assert.equal(ctx.fontes.at(-1).iniciou,ctx.currentTime+.187);
assert.equal(ctx.fontes.at(-1).canal.gain.value,.19);
audio.efeito('sair-fenda',335);
assert.equal(ctx.fontes.at(-1).iniciou,ctx.currentTime+.335);
audio.limparEfeitosDaCena();
assert(ctx.fontes.at(-1).parou);
assert(!ctx.fontes[0].parou);
audio.volumes({musica:.35,efeitos:0});
assert.equal(musica.gain.value,.35);
assert.equal(efeitos.gain.value,0);
const total = ctx.fontes.length;
audio.clique();
audio.eventos([{tipo:'vitoria'}]);
audio.efeito('derrota');
assert.equal(ctx.fontes.length,total);
console.log('11 WAV oficiais e novo passo de areia, mix e único clique nativo, primeiro gesto, volume isolado e ausência de bipes duplicados: OK.');
