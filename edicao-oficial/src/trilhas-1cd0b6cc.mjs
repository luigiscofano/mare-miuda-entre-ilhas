const PISTA_EMBUTIDA = '#trilha-offline-violao';
const SUBIDA_DE_GANHO = 0.02;

export function carregarTrilha() {
  const fonte = document.querySelector(PISTA_EMBUTIDA);
  // Na Web o WAV original só é requisitado quando o áudio é habilitado.
  if (fonte?.dataset?.src) return fetch(fonte.dataset.src).then(resposta => {
    if (!resposta.ok) throw new Error('Não foi possível carregar o áudio.');
    return resposta.arrayBuffer();
  });
  const embutido = fonte?.textContent;
  if (!embutido) throw new Error('Trilha offline indisponível.');
  const binario = atob(embutido.trim());
  const dados = new Uint8Array(binario.length);
  for (let i = 0; i < dados.length; i++) dados[i] = binario.charCodeAt(i);
  return dados.buffer;
}

export function criarTrilha(contexto, destino, carregar = carregarTrilha) {
  let audio;
  let leitura;
  let voz;
  let posicaoEmAmostras = 0;
  let ativa = false;
  let falhou = false;

  function interromper() {
    if (!voz) return;
    const { fonte, entrada, inicio, deslocamento } = voz;
    const percorridas = Math.max(0, Math.round((contexto.currentTime - inicio) * audio.sampleRate));
    posicaoEmAmostras = (deslocamento + percorridas) % audio.length;
    voz = undefined;
    if (contexto.state !== 'closed') fonte.stop();
    fonte.disconnect();
    entrada.disconnect();
  }

  function continuar() {
    if (!ativa || voz || !audio || contexto.state !== 'running') return;
    const agora = contexto.currentTime;
    const fonte = contexto.createBufferSource();
    const entrada = contexto.createGain();
    const deslocamento = posicaoEmAmostras;
    fonte.buffer = audio;
    // As voltas usam o PCM inteiro, sem padding de MP3, intervalos ou fades.
    fonte.loop = true;
    fonte.loopStart = 0;
    fonte.loopEnd = audio.length / audio.sampleRate;
    fonte.connect(entrada);
    entrada.connect(destino);
    entrada.gain.setValueAtTime(0, agora);
    entrada.gain.linearRampToValueAtTime(1, agora + SUBIDA_DE_GANHO);
    fonte.start(agora, deslocamento / audio.sampleRate);
    voz = { fonte, entrada, inicio: agora, deslocamento };
  }

  async function preparar() {
    try {
      const dados = await Promise.resolve().then(carregar);
      audio = await contexto.decodeAudioData(dados);
      if (!(audio?.length > 0 && audio.sampleRate > 0)) throw new Error('Trilha vazia.');
      continuar();
    } catch {
      // A navegação e os efeitos seguem funcionando se o navegador não decodificar a música.
      audio = undefined;
      falhou = true;
    } finally {
      leitura = undefined;
    }
  }

  return {
    sincronizar(podeTocar, tentarDeNovo = false) {
      ativa = podeTocar;
      if (!ativa) { interromper(); return; }
      if (tentarDeNovo) falhou = false;
      // Uma fonte por sessão visível: mudar de tela ou mundo não troca o áudio.
      if (audio) continuar();
      else if (!leitura && !falhou) leitura = preparar();
    },
  };
}
