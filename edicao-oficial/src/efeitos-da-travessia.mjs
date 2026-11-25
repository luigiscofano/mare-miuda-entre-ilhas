const CLIQUE = 'clique-botao';
const EFEITOS = [
  CLIQUE, 'cavar', 'sair-fenda', 'levada', 'retorno', 'garca', 'derrota',
  'mare-subindo', 'mare-descendo', 'perola', 'vitoria', 'passo-areia',
];
const LIMITE_PRIMEIRO_CLIQUE_MS = 180;

function carregarEfeito(nome) {
  const embutido = document.querySelector(`#efeito-offline-${nome}`)?.textContent;
  if (!embutido) throw new Error('Efeito offline indisponível.');
  const binario = atob(embutido.trim());
  const dados = new Uint8Array(binario.length);
  for (let i = 0; i < dados.length; i++) dados[i] = binario.charCodeAt(i);
  return dados.buffer;
}

export function nomeDoSinal(evento) {
  switch (evento.tipo) {
    case 'virada': return evento.alta ? 'mare-subindo' : 'mare-descendo';
    case 'fragmento': return 'perola';
    case 'vitoria': return 'vitoria';
    default: return undefined;
  }
}

// O evento click já unifica mouse, toque e ativação por Enter ou Espaço.
export function ativouBotao(evento) {
  const botao = evento.target?.closest?.('button');
  return evento.isTrusted && evento.type === 'click' && botao
    && !botao.matches(':disabled')
    && !botao.closest('[aria-disabled="true"], [inert], [hidden]');
}

export function criarEfeitosDaTravessia(ctx, destino, carregar = carregarEfeito) {
  const sons = new Map();
  const fontes = new Map();
  let pediu = false;
  let pendentes = [];
  let cliqueFalhou = false;

  function reproduzir(nome, atrasoMs = 0, volume = 1) {
    const buffer = sons.get(nome);
    if (!buffer || ctx.state !== 'running') return false;
    const fonte = ctx.createBufferSource();
    fonte.buffer = buffer;
    const ganho = volume === 1 ? undefined : ctx.createGain();
    if (ganho) {
      ganho.gain.value=volume;
      fonte.connect(ganho);
      ganho.connect(destino);
    } else fonte.connect(destino);
    fontes.set(fonte, nome);
    fonte.onended = () => {
      fontes.delete(fonte);
      fonte.disconnect();
      ganho?.disconnect();
    };
    fonte.start(ctx.currentTime + Math.max(.008, atrasoMs / 1000));
    return true;
  }

  function clicarQuandoPronto() {
    if (!sons.has(CLIQUE) || ctx.state !== 'running') return;
    const agora = performance.now();
    const aindaAtuais = pendentes.filter(quando => agora - quando <= LIMITE_PRIMEIRO_CLIQUE_MS);
    pendentes = [];
    aindaAtuais.forEach((_, i) => reproduzir(CLIQUE, i * 18));
  }

  return {
    carregar() {
      if (pediu) return;
      pediu = true;
      // Decodifica no primeiro gesto. Uma falha não silencia o restante.
      for (const nome of EFEITOS) {
        void Promise.resolve().then(() => carregar(nome)).then(dados => ctx.decodeAudioData(dados))
          .then(buffer => {
            if (!(buffer?.length > 0)) throw new Error('Efeito vazio.');
            sons.set(nome, buffer);
            if (nome === CLIQUE) clicarQuandoPronto();
          }).catch(() => {
            if (nome === CLIQUE) { cliqueFalhou = true; pendentes = []; }
          });
      }
    },
    tocar: reproduzir,
    clicar() {
      if (reproduzir(CLIQUE) || cliqueFalhou) return;
      // O primeiro toque pode chegar antes da decodificação; expira se o navegador demorar a liberar o áudio.
      const agora = performance.now();
      pendentes = pendentes.filter(quando => agora - quando <= LIMITE_PRIMEIRO_CLIQUE_MS);
      pendentes.push(agora);
    },
    clicarQuandoPronto,
    parar(incluirClique = true) {
      if (incluirClique) pendentes = [];
      for (const [fonte, nome] of fontes) {
        if (!incluirClique && nome === CLIQUE) continue;
        try { fonte.stop(); }
        catch { /* O dispositivo pode ter fechado o contexto. */ }
        fonte.disconnect();
        fontes.delete(fonte);
      }
    },
  };
}
