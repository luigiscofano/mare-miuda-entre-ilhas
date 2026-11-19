import type { Direcao } from '../motor/index.ts';

const TECLAS: ReadonlyMap<string, Direcao> = new Map([
  ['arrowup', 'cima'], ['w', 'cima'], ['arrowdown', 'baixo'], ['s', 'baixo'],
  ['arrowleft', 'esquerda'], ['a', 'esquerda'], ['arrowright', 'direita'], ['d', 'direita'],
]);

export function conectarTeclado(janela: Window, mover: (direcao: Direcao) => void, reiniciar: () => void): void {
  janela.addEventListener('keydown', evento => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.isComposing) return;
    const alvo = evento.target;
    if (alvo instanceof Element && alvo.closest('textarea, input, select, [contenteditable="true"]')) return;
    const tecla = evento.key.toLowerCase();
    const direcao = TECLAS.get(tecla);
    if (!direcao && tecla !== 'r') return;
    // Uma tecla pressionada é um turno intencional, nunca uma fila de repetições.
    evento.preventDefault();
    if (evento.repeat) return;
    if (direcao) mover(direcao);
    else reiniciar();
  });
}
