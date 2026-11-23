import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] ?? 'dist/mare-miuda-prototipo.html', 'utf8');
const uri = /data:text\/javascript;base64,[A-Za-z0-9+/]+=*/;
const fonte = url => Buffer.from(url.split(',')[1], 'base64').toString('utf8');
const entrada = fonte(html.match(uri)[0]);
const controlador = entrada.split('\n').find(linha => linha.startsWith('import { criarAudio ')).match(uri)[0];
const trilha = fonte(controlador).split('\n').find(linha => linha.startsWith('import { criarTrilha ')).match(uri)[0];
const { criarAudio } = await import(controlador);
const { criarTrilha } = await import(trilha);
const pista = html.match(/<script type="application\/octet-stream" id="trilha-offline-violao">([A-Za-z0-9+/=]+)<\/script>/);
assert(pista);
assert.equal((html.match(/id="trilha-offline-/g) ?? []).length, 1);
const pcm = Buffer.from(pista[1], 'base64');
assert.equal(createHash('sha256').update(pcm).digest('hex'), 'd74670604f0f39e99d0390e76772c865486f898358800d71f4d28173dea36bf6');

function lerPcm(wav) {
  assert.equal(wav.toString('ascii',0,4), 'RIFF');
  assert.equal(wav.toString('ascii',8,12), 'WAVE');
  let fmt, dados;
  for (let i=12; i+8<=wav.length;) {
    const nome=wav.toString('ascii',i,i+4);
    const tamanho=wav.readUInt32LE(i+4);
    if (nome==='fmt ') fmt=wav.subarray(i+8,i+8+tamanho);
    if (nome==='data') dados=wav.subarray(i+8,i+8+tamanho);
    i += 8+tamanho+(tamanho%2);
  }
  assert(fmt && dados);
  assert.equal(fmt.readUInt16LE(0), 1);
  const sampleRate=fmt.readUInt32LE(4), canais=fmt.readUInt16LE(2);
  const bytes=fmt.readUInt16LE(14)/8;
  assert.equal(canais,2);
  assert.equal(bytes,2);
  assert.equal(sampleRate,48000);
  assert.equal(dados.length % (canais*bytes),0);
  return { length:dados.length/(canais*bytes), sampleRate, dados };
}
const buffer = lerPcm(pcm);
assert.equal(buffer.length,2048000);
const amostra = (quadro, canal) => buffer.dados.readInt16LE(quadro*4+canal*2);
// A costura não pode saltar mais que um passo adjacente normal do violão.
for (const canal of [0,1]) {
  const limite = Math.max(...Array.from({length:4000},(_,n)=>Math.abs(amostra(n+1,canal)-amostra(n,canal))));
  const delta = Math.abs(amostra(buffer.length-1,canal)-amostra(0,canal));
  assert(delta <= limite, `Canal ${canal}: emenda ${delta}, máximo perto dela ${limite}`);
}

const aguardar = () => new Promise(resolve => setImmediate(resolve));
class Parametro {
  value = 1;
  eventos = [];
  setValueAtTime(valor, tempo) { this.eventos.push(['inicio', valor, tempo]); }
  linearRampToValueAtTime(valor, tempo) { this.eventos.push(['rampa', valor, tempo]); }
  exponentialRampToValueAtTime() {}
  setTargetAtTime(valor, tempo, duracao) { this.eventos.push(['alvo', valor, tempo, duracao]); }
}
class No {
  ganho = new Parametro();
  gain = this.ganho;
  saidas = [];
  connect(no) { this.saidas.push(no); }
  disconnect() { this.saidas = []; }
}
class Fonte extends No {
  partidas = [];
  paradas = [];
  start(...args) { this.partidas.push(args); }
  stop(...args) { this.paradas.push(args); }
}
class Contexto {
  static instancias = [];
  state = 'suspended';
  currentTime = 0;
  destination = new No();
  fontes = [];
  ganhos = [];
  osciladores = [];
  leituras = 0;
  ouvintes = new Set();
  constructor() { Contexto.instancias.push(this); }
  createGain() { const no = new No(); this.ganhos.push(no); return no; }
  createBufferSource() { const no = new Fonte(); this.fontes.push(no); return no; }
  createOscillator() {
    const no = new Fonte();
    no.frequency=new Parametro();
    this.osciladores.push(no);
    return no;
  }
  async decodeAudioData(dados) {
    this.leituras++;
    assert.deepEqual(Buffer.from(dados), pcm);
    return lerPcm(Buffer.from(dados));
  }
  addEventListener(evento, fn) { assert.equal(evento,'statechange'); this.ouvintes.add(fn); }
  removeEventListener(evento, fn) { this.ouvintes.delete(fn); }
  mudarEstado(estado) { this.state=estado; for (const fn of this.ouvintes) fn(); }
  async resume() { this.mudarEstado('running'); }
}

const antesAudioContext = globalThis.AudioContext;
const antesDocumento = globalThis.document;
globalThis.AudioContext = Contexto;
globalThis.document = { querySelector: id => {
  assert.equal(id, '#trilha-offline-violao');
  return { textContent: pista[1] };
} };

try {
  const audio=criarAudio();
  audio.ambiente(true);
  assert.equal(Contexto.instancias.length,0,'Não inicializar antes do gesto');
  await audio.habilitar();
  await aguardar();
  const ctx=Contexto.instancias[0];
  const [musica, efeitos]=ctx.ganhos;
  assert.deepEqual([musica.gain.value, efeitos.gain.value],[.35,.55]);
  assert.equal(ctx.leituras,1);
  assert.equal(ctx.fontes.length,1);
  const primeira=ctx.fontes[0];
  assert.equal(primeira.loop,true);
  assert.equal(primeira.loopStart,0);
  assert.equal(primeira.loopEnd,2048000/48000);
  assert.deepEqual(primeira.partidas,[[0,0]]);
  assert.deepEqual(primeira.saidas[0].saidas,[musica]);

  // Cada troca de tela no jogo responde apenas com ambiente(true).
  for (let i=1;i<=16;i++) { ctx.currentTime=i*5; audio.ambiente(true); }
  audio.volumes({musica:0,efeitos:.72});
  assert.deepEqual(musica.gain.eventos.at(-1),['alvo',0,80,.02]);
  assert.deepEqual(efeitos.gain.eventos.at(-1),['alvo',.72,80,.02]);
  assert.equal(ctx.fontes.length,1,'Nem mute nem trocas de tela recriam a fonte');
  assert.deepEqual(primeira.paradas,[]);
  audio.eventos([{tipo:'virada',alta:true}]);
  assert.equal(ctx.osciladores.length,3, 'Efeitos funcionam com a música muda');
  assert.deepEqual(ctx.osciladores[0].saidas[0].saidas[0].saidas,[efeitos]);
  audio.volumes({musica:.35,efeitos:0});
  const ativos=ctx.osciladores.length;
  audio.eventos([{tipo:'fragmento'}]);
  assert.equal(ctx.osciladores.length,ativos,'Música não obriga efeitos ligados');

  ctx.currentTime=2*primeira.loopEnd+.5;
  audio.ambiente(false);
  assert.equal(primeira.paradas.length,1);
  ctx.currentTime+=7;
  audio.ambiente(true);
  assert.equal(ctx.fontes.length,2);
  assert.deepEqual(ctx.fontes[1].partidas,[[ctx.currentTime,.5]],'Aba retoma na mesma amostra');
  assert.equal(ctx.leituras,1,'Reusa PCM já decodificado');
  ctx.mudarEstado('interrupted');
  assert.equal(ctx.fontes[1].paradas.length,1);
  await audio.habilitar();
  assert.equal(ctx.fontes.length,3);
  assert.deepEqual(ctx.fontes[2].partidas,[[ctx.currentTime,.5]]);
  ctx.mudarEstado('closed');
  await audio.habilitar();
  await aguardar();
  assert.equal(Contexto.instancias.length,2);
  assert.equal(Contexto.instancias[1].fontes.length,1);

  const provedor=new Contexto();
  provedor.state='running';
  let chamadas=0;
  const reaberta=criarTrilha(provedor,provedor.destination,() => {
    if (++chamadas===1) throw new Error('Falha de leitura simulada');
    return pcm.buffer.slice(pcm.byteOffset,pcm.byteOffset+pcm.byteLength);
  });
  reaberta.sincronizar(true);
  await aguardar();
  assert.equal(provedor.fontes.length,0);
  reaberta.sincronizar(true);
  assert.equal(chamadas,1,'Sem repetição automática em cada troca de tela');
  reaberta.sincronizar(true,true);
  await aguardar();
  assert.equal(chamadas,2);
  assert.equal(provedor.fontes.length,1);
} finally {
  globalThis.AudioContext=antesAudioContext;
  globalThis.document=antesDocumento;
}
console.log('PCM aprovado (2.048.000 amostras), emenda, fonte persistente, pausa e retomada, volumes isolados e recuperação de erro: OK.');
