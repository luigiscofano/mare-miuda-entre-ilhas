import { criarProgresso, ehIdFase, normalizarPosicao, mundoValido } from '@@MARE:modulo:src/mundo-valido-900be48c.mjs@@';
                                                      

export const CHAVE_SAVE = 'mare-miuda-entre-ilhas/praia-v1';
                                                                  
                                                                           
const VERSAO = 1;
const volume = (valor         , padrao        ) =>
  typeof valor === 'number' && Number.isFinite(valor) ? Math.min(1, Math.max(0, valor)) : padrao;

export function carregar(storage                                      )       {
  const padrao = { progresso: criarProgresso(), audio: { musica: 0.35, efeitos: 0.55 } };
  try {
    const bruto = storage?.getItem(CHAVE_SAVE);
    if (!bruto) return padrao;
    const registro = JSON.parse(bruto);
    if (registro?.versao !== VERSAO) return padrao;
    const salvo = registro.progresso;
    const legado = mundoValido(salvo?.mundo) ? salvo.mundo : undefined;
    const pos = salvo?.posicao;
    const concluidas = Array.isArray(salvo?.concluidas)
      ? [...new Set         (salvo.concluidas)].filter(ehIdFase) : [];
    const origem = pos && Number.isInteger(pos.coluna) && Number.isInteger(pos.linha)
      ? { coluna: pos.coluna, linha: pos.linha } : undefined;
    return {
      progresso: {
        posicao: normalizarPosicao(legado ?? 'praia', origem, concluidas),
        ...(legado ? { mundo: legado } : {}),
        concluidas,
        viuTutorial: salvo?.viuTutorial === true,
      },
      audio: {
        musica: volume(registro.audio?.musica, padrao.audio.musica),
        efeitos: volume(registro.audio?.efeitos, padrao.audio.efeitos),
      },
    };
  } catch {
    // Navegadores podem bloquear storage, especialmente ao abrir um HTML local.
    // O jogo continua em memória e a interface explica essa condição.
    return padrao;
  }
}

export function salvar(storage                                      , save      )          {
  if (!storage) return false;
  try {
    storage.setItem(CHAVE_SAVE, JSON.stringify({ versao: VERSAO, ...save }));
    return true;
  } catch {
    return false;
  }
}
