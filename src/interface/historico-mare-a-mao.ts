import {
  DIFICULDADES_MARE_A_MAO, MUNDOS_MARE_A_MAO, type OpcoesMareAMao,
} from '../mare-a-mao/index.ts';

export const CHAVE_HISTORICO_MARE = 'mare-miuda-entre-ilhas/mare-a-mao-v1';
export type EntradaMareAMao = Readonly<{ semente: string; opcoes: OpcoesMareAMao }>;
const LIMITE_HISTORICO = 12;

function entradaValida(entrada: EntradaMareAMao | null): entrada is EntradaMareAMao {
  const o = entrada?.opcoes;
  return !!o && typeof entrada.semente === 'string' && entrada.semente.trim().length > 0 && entrada.semente.length <= 80
    && MUNDOS_MARE_A_MAO.some(m => m === o.mundo) && DIFICULDADES_MARE_A_MAO.some(d => d === o.dificuldade)
    && (o.siris === 1 || o.siris === 2 || o.siris === 3)
    && typeof o.garca === 'boolean' && typeof o.fragmento === 'boolean';
}

// Esta chave guarda só as sementes e os filtros do modo; não lê nem grava a campanha.
export function lerHistoricoMare(storage: Pick<Storage, 'getItem'> | undefined): EntradaMareAMao[] {
  try {
    const dados = JSON.parse(storage?.getItem(CHAVE_HISTORICO_MARE) ?? '[]');
    return Array.isArray(dados) ? dados.filter(entradaValida).slice(0, LIMITE_HISTORICO) : [];
  } catch {
    return [];
  }
}

export function incluirNoHistorico(historico: readonly EntradaMareAMao[], nova: EntradaMareAMao): EntradaMareAMao[] {
  return [nova, ...historico.filter(a => a.semente !== nova.semente ||
    a.opcoes.mundo !== nova.opcoes.mundo || a.opcoes.dificuldade !== nova.opcoes.dificuldade ||
    a.opcoes.siris !== nova.opcoes.siris || a.opcoes.fragmento !== nova.opcoes.fragmento ||
    a.opcoes.garca !== nova.opcoes.garca)].slice(0, LIMITE_HISTORICO);
}

export function salvarHistoricoMare(storage: Pick<Storage, 'setItem'> | undefined, historico: readonly EntradaMareAMao[]): boolean {
  try {
    if (!storage) return false;
    storage.setItem(CHAVE_HISTORICO_MARE, JSON.stringify(historico));
    return true;
  } catch {
    return false;
  }
}
