import { criarProgresso, destinoValido, ehIdFase, mundoValido } from '../campanha/index.ts';
import type { Progresso } from '../campanha/index.ts';

export const CHAVE_SAVE = 'mare-miuda-entre-ilhas/praia-v1';
type Preferencias = Readonly<{ musica: number; efeitos: number }>;
export type Save = Readonly<{ progresso: Progresso; audio: Preferencias }>;
const VERSAO = 1;
const volume = (valor: unknown, padrao: number) =>
  typeof valor === 'number' && Number.isFinite(valor) ? Math.min(1, Math.max(0, valor)) : padrao;

export function carregar(storage: Pick<Storage, 'getItem'> | undefined): Save {
  const padrao = { progresso: criarProgresso(), audio: { musica: 0.35, efeitos: 0.55 } };
  try {
    const bruto = storage?.getItem(CHAVE_SAVE);
    if (!bruto) return padrao;
    const registro = JSON.parse(bruto);
    if (registro?.versao !== VERSAO) return padrao;
    const salvo = registro.progresso;
    const legado = mundoValido(salvo?.mundo) ? salvo.mundo : undefined;
    const pos = salvo?.posicao;
    const posicao = pos && Number.isInteger(pos.coluna) && Number.isInteger(pos.linha) && destinoValido(pos, legado)
      ? { coluna: pos.coluna, linha: pos.linha } : padrao.progresso.posicao;
    return {
      progresso: {
        posicao,
        ...(legado ? { mundo: legado } : {}),
        concluidas: Array.isArray(salvo?.concluidas)
          ? [...new Set<unknown>(salvo.concluidas)].filter(ehIdFase) : [],
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

export function salvar(storage: Pick<Storage, 'setItem'> | undefined, save: Save): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CHAVE_SAVE, JSON.stringify({ versao: VERSAO, ...save }));
    return true;
  } catch {
    return false;
  }
}
