import { criarTrilha } from '@@MARE:modulo:src/trilhas-1cd0b6cc.mjs@@';
import { criarEfeitosDaTravessia, nomeDoSinal } from '@@MARE:modulo:src/efeitos-da-travessia.mjs@@';
export { ativouBotao } from '@@MARE:modulo:src/efeitos-da-travessia.mjs@@';

export function criarAudio() {
  let contexto;
  let canais;
  let retomando;
  let trilha;
  let amostras;
  let ambienteAtivo = false;
  let desejos = { musica: .35, efeitos: .55 };

  const efeitosAudiveis = () => ambienteAtivo && desejos.efeitos > 0;
  function sincronizar(tentarDeNovo = false) {
    const tocando = contexto?.state === 'running' && ambienteAtivo;
    trilha?.sincronizar(tocando, tentarDeNovo);
    if (!efeitosAudiveis() || contexto?.state === 'closed' || contexto?.state === 'interrupted')
      amostras?.parar();
    else if (tocando) amostras?.clicarQuandoPronto();
  }
  const estadoMudou = () => sincronizar();

  return {
    async habilitar() {
      if (retomando) return;
      if (contexto?.state === 'running') { sincronizar(true); return; }
      try {
        if (!contexto || contexto.state === 'closed') {
          if (typeof AudioContext === 'undefined') return;
          contexto?.removeEventListener('statechange', estadoMudou);
          trilha?.sincronizar(false);
          amostras?.parar();
          contexto = new AudioContext();
          canais = { musica: contexto.createGain(), efeitos: contexto.createGain() };
          for (const [canal, ganho] of Object.entries(canais)) {
            ganho.gain.value = desejos[canal];
            ganho.connect(contexto.destination);
          }
          trilha = criarTrilha(contexto, canais.musica);
          amostras = criarEfeitosDaTravessia(contexto, canais.efeitos);
          amostras.carregar();
          contexto.addEventListener('statechange', estadoMudou);
        }
        if (contexto.state === 'suspended' || contexto.state === 'interrupted') {
          // O Safari também pode entrar em "interrupted". Apenas um gesto retoma.
          retomando = contexto.resume();
          await retomando;
        }
      } catch {
        // A partida continua quando o navegador não consegue abrir o áudio.
      } finally {
        retomando = undefined;
        sincronizar();
      }
    },
    volumes(novos) {
      desejos = novos;
      if (contexto && contexto.state !== 'closed' && canais) {
        for (const [canal, ganho] of Object.entries(canais))
          ganho.gain.setTargetAtTime(desejos[canal], contexto.currentTime, .02);
      }
      sincronizar();
    },
    ambiente(ativo) {
      ambienteAtivo = ativo;
      sincronizar();
    },
    efeito(nome, atrasoMs = 0, volume = 1) {
      if (efeitosAudiveis()) amostras?.tocar(nome, atrasoMs, volume);
    },
    clique() {
      if (efeitosAudiveis()) amostras?.clicar();
    },
    limparEfeitosDaCena() { amostras?.parar(false); },
    eventos(eventos) {
      if (!efeitosAudiveis()) return;
      for (const evento of eventos) {
        const nome = nomeDoSinal(evento);
        if (nome) amostras?.tocar(nome);
      }
    },
  };
}
