import { executarPasso, iniciar, lerCelula, LIMITE_LEVADAS } from '../motor/index.ts';
import type { Direcao, Fase } from '../motor/index.ts';

export function validarMapa(fase: Fase): void {
  const largura = fase.mapa[0]?.length ?? 0;
  const celulas = fase.mapa.join('');
  const contar = (simbolo: string) => [...celulas].filter(valor => valor === simbolo).length;
  if (!largura || fase.mapa.some(linha => linha.length !== largura) || /[^S.=#CBG]/.test(celulas)) {
    throw new Error(`Mapa retangular inválido: ${fase.id}.`);
  }
  if (contar('S') !== 1 || contar('C') + contar('G') !== 1 || contar('G') !== contar('B')) {
    throw new Error(`Início ou objetivo inválido: ${fase.id}.`);
  }
  if (!fase.ameaca) return;
  const { alvo, primeiroAtaque, periodo } = fase.ameaca;
  const terreno = lerCelula(fase, alvo);
  if (!terreno || terreno === '#' || !Number.isInteger(periodo) || periodo < 1
    || !Number.isInteger(primeiroAtaque) || primeiroAtaque < 1) {
    throw new Error(`Ameaça inválida: ${fase.id}.`);
  }
}

// Reproduz exatamente as direções que uma pessoa enviaria. Um passo bloqueado
// ou um comando depois do fim não contam como solução válida.
export function reproduzir(fase: Fase, direcoes: readonly Direcao[]) {
  let estado = iniciar(fase);
  for (const direcao of direcoes) {
    const resultado = executarPasso(fase, estado, direcao);
    if (resultado.estado === estado) throw new Error(`Comando inválido após ${estado.passos} passos.`);
    estado = resultado.estado;
  }
  return estado;
}

export function validarSolucao(fase: Fase): boolean {
  validarMapa(fase);
  const estado = reproduzir(fase, fase.solucao);
  return estado.situacao === 'vitoria' && estado.levadas === 0 && estado.levadas < LIMITE_LEVADAS;
}
