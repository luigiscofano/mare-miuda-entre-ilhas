import { mundoAtual } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
import { opcoesDoSeletor } from '../campanha/seletor.ts';
import type { Categoria, OpcaoDoSeletor } from '../campanha/seletor.ts';

type Tema = Exclude<Mundo, 'arquipelago' | 'praia-enseadinha'>;
// O tamanho de cada fileira é espelhado horizontalmente. O DOM segue a
// leitura natural e a folha de estilos não remapeia a ordem do teclado.
const TEMAS: Readonly<Record<Tema, readonly number[]>> = {
  praia: [2, 3, 3, 2],     // Anel de areia em torno da poça.
  recifes: [3, 2, 2, 3],   // Contorno do coral.
  mangue: [2, 4, 4],       // Margens de um canal.
  enseada: [4, 2, 4],      // Abertura das asas.
  deriva: [5, 5],          // Dois cais paralelos.
  grutas: [2, 4, 2, 2],    // Arco escalonado.
  ressaca: [3, 2, 3, 2],   // Dois arcos de espuma.
  farol: [1, 3, 2, 3, 1],  // Pontas do cristal.
};
const GRUPOS: readonly [Categoria, string][] = [
  ['regular', 'Travessias'], ['bonus', 'Bônus e desvios'], ['chefe', 'Chefes opcionais'], ['viagem', 'Viagem'],
];
const ESTADOS = { bloqueada: 'Bloqueada', disponivel: 'Disponível', concluida: 'Concluída' } as const;

function botaoDoMarco(doc: Document, opcao: OpcaoDoSeletor, ativar: (id: string) => void, numero?: number) {
  const botao = doc.createElement('button');
  botao.type = 'button';
  botao.className = 'seletor-marco';
  botao.dataset.marco = opcao.id;
  botao.dataset.estado = opcao.estado;
  botao.dataset.categoria = opcao.categoria;
  const rotulo = doc.createElement('span');
  rotulo.textContent = numero === undefined ? opcao.nome : `${numero}. ${opcao.nome}`;
  const estado = doc.createElement('small');
  estado.textContent = ESTADOS[opcao.estado];
  if (opcao.estado === 'bloqueada') {
    // Mantém a tecla Tab e o motivo acessíveis, sem permitir entrada pela UI.
    botao.setAttribute('aria-disabled', 'true');
    if (opcao.motivo) {
      estado.textContent += ' · ' + opcao.motivo;
    }
  } else {
    botao.addEventListener('click', () => ativar(opcao.id));
  }
  botao.append(rotulo, estado);
  return botao;
}

export function renderizarSeletor(doc: Document, painel: HTMLElement, p: Progresso, ativar: (id: string) => void) {
  const mundo = mundoAtual(p);
  if (mundo === 'arquipelago') return;
  const tema = mundo === 'praia-enseadinha' ? 'praia' : mundo;
  painel.dataset.tema = tema;
  painel.replaceChildren();
  const opcoes = opcoesDoSeletor(p);
  for (const [categoria, titulo] of GRUPOS) {
    const grupo = opcoes.filter(item => item.categoria === categoria);
    if (!grupo.length) continue;
    const secao = doc.createElement('section');
    const heading = doc.createElement('h3');
    heading.textContent = titulo;
    secao.append(heading);
    const tamanhos = categoria !== 'regular' ? [grupo.length]
      : tema === 'praia' ? mundo === 'praia' ? [2, 2] : [1, 2]
      : TEMAS[tema];
    let indice = 0;
    for (const tamanho of tamanhos) {
      const fileira = doc.createElement('div');
      fileira.className = 'seletor-fileira';
      for (const item of grupo.slice(indice, indice + tamanho)) {
        const numero = ++indice;
        fileira.append(botaoDoMarco(doc, item, ativar, categoria === 'regular' ? numero : undefined));
      }
      secao.append(fileira);
    }
    painel.append(secao);
  }
}
