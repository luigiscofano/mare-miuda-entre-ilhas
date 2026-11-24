// Cada gesto completo equivale a uma única pressão de seta. Só o tabuleiro
// intercepta o deslizamento; a página continua rolável pelas suas margens.
const LIMIAR = 24;
const DOMINANCIA = 1.25;

export function direcaoDoDeslize(dx, dy) {
  const x = Math.abs(dx), y = Math.abs(dy);
  if (x >= LIMIAR && x >= y * DOMINANCIA) return dx > 0 ? 'direita' : 'esquerda';
  if (y >= LIMIAR && y >= x * DOMINANCIA) return dy > 0 ? 'baixo' : 'cima';
}

export function conectarDeslizeNoTabuleiro(tabuleiro, janela, mover, podeMover) {
  let gesto;
  function cancelar(id = gesto?.id) {
    if (!gesto || gesto.id !== id) return;
    gesto = undefined;
    if (tabuleiro.hasPointerCapture?.(id)) tabuleiro.releasePointerCapture(id);
  }
  janela.addEventListener('pointerdown', evento => {
    // Um segundo dedo, inclusive iniciado fora do tabuleiro, cancela o passo.
    if (gesto && evento.pointerType !== 'mouse' && evento.pointerId !== gesto.id) cancelar();
  }, true);
  tabuleiro.addEventListener('pointerdown', evento => {
    if (gesto || evento.pointerType === 'mouse' || !evento.isPrimary || evento.button !== 0 || !podeMover()) return;
    gesto = { id: evento.pointerId, x: evento.clientX, y: evento.clientY };
    tabuleiro.setPointerCapture?.(gesto.id);
  });
  tabuleiro.addEventListener('pointerup', evento => {
    if (!gesto || evento.pointerId !== gesto.id) return;
    const direcao = direcaoDoDeslize(evento.clientX - gesto.x, evento.clientY - gesto.y);
    cancelar();
    if (direcao && podeMover()) mover(direcao);
  });
  for (const tipo of ['pointercancel', 'lostpointercapture'])
    tabuleiro.addEventListener(tipo, evento => cancelar(evento.pointerId));
  janela.addEventListener('blur', () => cancelar());
  return cancelar;
}
