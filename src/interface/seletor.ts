import { mundoAtual } from '../campanha/index.ts';
import type { Mundo, Progresso } from '../campanha/index.ts';
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

function desenharFileiras(
  doc: Document, secao: HTMLElement, grupo: readonly OpcaoDoSeletor[], tamanhos: readonly number[],
  botao: (item: OpcaoDoSeletor) => HTMLButtonElement,
) {
  let indice = 0;
  for (const tamanho of tamanhos) {
    const itens = grupo.slice(indice, indice + tamanho);
    if (!itens.length) break;
    const fileira = doc.createElement('div');
    fileira.className = 'seletor-fileira';
    fileira.append(...itens.map(botao));
    secao.append(fileira);
    indice += tamanho;
  }
}

const fileirasCurtas = (total: number) => Array.from({ length: Math.ceil(total / 3) }, () => 3);

function desenharSequencias(
  doc: Document, secao: HTMLElement, grupo: readonly OpcaoDoSeletor[],
  botao: (item: OpcaoDoSeletor) => HTMLButtonElement,
) {
  let indice = 0;
  while (indice < grupo.length) {
    const ancora = grupo[indice++];
    const sequencia = [ancora];
    while (indice < grupo.length && grupo[indice].depoisDe === ancora.id) sequencia.push(grupo[indice++]);
    if (sequencia.length === 1) {
      // Mantém marcos originais vizinhos na mesma fileira, quando possível.
      while (indice < grupo.length && sequencia.length < 3 && !grupo[indice + 1]?.depoisDe) {
        sequencia.push(grupo[indice++]);
      }
      desenharFileiras(doc, secao, sequencia, [sequencia.length], botao);
      continue;
    }
    const bloco = doc.createElement('section');
    bloco.className = 'seletor-sequencia';
    const titulo = doc.createElement('h4');
    titulo.textContent = `Trecho: ${ancora.nome}`;
    bloco.append(titulo);
    desenharFileiras(doc, bloco, sequencia, fileirasCurtas(sequencia.length), botao);
    secao.append(bloco);
  }
}

export function renderizarSeletor(doc: Document, painel: HTMLElement, p: Progresso, opcoes: readonly OpcaoDoSeletor[], ativar: (id: string) => void) {
  const mundo = mundoAtual(p);
  if (mundo === 'arquipelago') return;
  const tema = mundo === 'praia-enseadinha' ? 'praia' : mundo;
  painel.dataset.tema = tema;
  painel.replaceChildren();
  for (const [categoria, titulo] of GRUPOS) {
    const grupo = opcoes.filter(item => item.categoria === categoria);
    if (!grupo.length) continue;
    const secao = doc.createElement('section');
    const heading = doc.createElement('h3');
    heading.textContent = titulo;
    secao.append(heading);
    let numero = 0;
    const botao = (item: OpcaoDoSeletor) => botaoDoMarco(doc, item, ativar, categoria === 'regular' ? ++numero : undefined);
    if (categoria === 'regular' && grupo.some(item => item.depoisDe)) {
      desenharSequencias(doc, secao, grupo, botao);
    } else {
      const tamanhos = categoria !== 'regular' ? [grupo.length]
        : tema === 'praia' ? mundo === 'praia' ? [2, 2] : [1, 2]
        : TEMAS[tema];
      desenharFileiras(doc, secao, grupo, tamanhos, botao);
    }
    painel.append(secao);
  }
}
