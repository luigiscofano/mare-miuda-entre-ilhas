import type { Direcao } from '../motor/index.ts';

const TECLAS: ReadonlyMap<string, Direcao> = new Map([
  ['arrowup', 'cima'], ['w', 'cima'], ['arrowdown', 'baixo'], ['s', 'baixo'],
  ['arrowleft', 'esquerda'], ['a', 'esquerda'], ['arrowright', 'direita'], ['d', 'direita'],
]);

export function conectarTeclado(
  janela: Window,
  mover: (direcao: Direcao) => void,
  reiniciar: () => void,
  entrar: () => void,
  voltar: () => void,
  emJogo: () => boolean,
): void {
  janela.addEventListener('keydown', evento => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.isComposing) return;
    const alvo = evento.target;
    if (alvo instanceof Element && alvo.closest('textarea, input, select, [contenteditable="true"]')) return;
    const tecla = evento.key.toLowerCase();
    if (tecla === 'escape') { voltar(); return; }
    if (!emJogo()) return;
    // Enter continua acionando controles nativos com foco, sem disparo duplo.
    if (tecla === 'enter' && alvo instanceof Element && alvo.closest('button, a, summary')) return;
    const direcao = TECLAS.get(tecla);
    if (!direcao && tecla !== 'r' && tecla !== 'enter') return;
    // Uma tecla intencional é um turno, não uma fila de repetições.
    evento.preventDefault();
    if (evento.repeat) return;
    if (direcao) mover(direcao);
    else if (tecla === 'enter') entrar();
    else reiniciar();
  });
}
