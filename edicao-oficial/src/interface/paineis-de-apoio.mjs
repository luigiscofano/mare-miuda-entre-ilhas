export function criarPaineisDeApoio({ jogo, fundo, corpo, documento }) {
  let atual;

  function fechar({ restaurarFoco = true, notificar = true } = {}) {
    if (!atual) return false;
    const { painel, abertura, bloqueados, aoFechar } = atual;
    atual = undefined;
    painel.hidden = true;
    fundo.hidden = true;
    corpo.removeAttribute('data-painel-apoio-aberto');
    abertura?.setAttribute('aria-expanded', 'false');
    for (const elemento of bloqueados) elemento.removeAttribute('inert');
    if (notificar && aoFechar) aoFechar();
    else if (restaurarFoco) abertura?.focus({ preventScroll: true });
    return true;
  }
  function abrir({ painel, abertura, foco, aoFechar }) {
    if (atual?.painel === painel) return;
    fechar({ restaurarFoco: false, notificar: false });
    // Só removemos o inert que este painel adicionou. O restante da tela não muda.
    const bloqueados = Array.from(jogo.children).filter(no =>
      no !== painel && no !== fundo && !no.hasAttribute('inert'));
    for (const elemento of bloqueados) elemento.setAttribute('inert', '');
    atual = { painel, abertura, bloqueados, aoFechar };
    fundo.hidden = false;
    painel.hidden = false;
    const conteudo = painel.querySelector('.painel-apoio-conteudo');
    if (conteudo) conteudo.scrollTop = 0;
    corpo.setAttribute('data-painel-apoio-aberto', '');
    abertura?.setAttribute('aria-expanded', 'true');
    foco.focus({ preventScroll: true });
  }
  fundo.addEventListener('click', () => fechar());
  function aceitaFoco(elemento) {
    if (elemento.disabled || elemento.closest('[hidden]')) return false;
    const detalhes = elemento.closest('details');
    // O resumo de um histórico recolhido continua navegável, os itens não.
    return !detalhes || detalhes.open || elemento === detalhes.querySelector('summary');
  }
  jogo.addEventListener('keydown', evento => {
    if (!atual) return;
    if (evento.key === 'Escape') {
      evento.preventDefault();
      evento.stopPropagation();
      fechar();
      return;
    }
    if (evento.key !== 'Tab') return;
    const alvos = Array.from(atual.painel.querySelectorAll('[data-foco-painel]'))
      .filter(aceitaFoco);
    const posicao = alvos.indexOf(documento.activeElement);
    if (posicao < 0 || (evento.shiftKey ? posicao===0 : posicao===alvos.length-1)) {
      evento.preventDefault();
      (evento.shiftKey ? alvos.at(-1) : alvos[0])?.focus();
    }
  });
  return { abrir, fechar, aberto: () => Boolean(atual) };
}
