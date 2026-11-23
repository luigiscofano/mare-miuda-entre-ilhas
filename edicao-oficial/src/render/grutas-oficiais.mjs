import { reduzirReflexos } from '@@MARE:modulo:src/selecionar-espalhados-8db16b0e.mjs@@';
import { crescimentoDeFiletesNaBase } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
import { pintarPecaPraia,                  } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
import { pintarConchaDoMundo, pintarBrilhosDoObjetivo } from '@@MARE:modulo:src/conchas-dos-mundos-192a41fd.mjs@@';
                                                      
import { bocaSubmersa, fendaAtiva } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
import { preverDirecoesDaEquipe } from '@@MARE:modulo:src/nomes-dos-siris-e97b332f.mjs@@';
import { desenharLitoralOficial } from '@@MARE:modulo:src/desenhar-litoral-oficial-238d1ca4.mjs@@';
                                                                      
import { pintarPecaEnseada } from '@@MARE:modulo:src/pintar-peca-enseada-7af0f0ca.mjs@@';
import { pintarPecaGrutas } from '@@MARE:modulo:src/pintar-peca-grutas-4a2aa20d.mjs@@';
                                                    
import { CASA_PRAIA, chaveDaCasa } from '@@MARE:modulo:src/render/praia-oficial-terreno.mjs@@';
                                                                
import { traçosNoMar } from '@@MARE:modulo:src/render/encaixe-costeiro.mjs@@';
import { visitaDaPraia, pintarVisitaDaPraia } from '@@MARE:modulo:src/nomes-das-rochas-6e85a20e.mjs@@';
                                                                

export const PALETA_GRUTAS                = {
  mar: '#142e47', reflexoMar: '#2d425e',
  aguaRasa: ['#3b596f', '#4e6b81', '#678396', '#2a435d', '#91acba'],
  seca: ['#ded1c8', '#f1e1d5', '#a58c94', '#e6d7cf', '#cbb7b4'],
  molhada: ['#a092a6', '#b3a1ad', '#807187', '#aa98a8', '#96889e'],
  graos: ['#ad8990', '#ba9a9f'],
  juntaSeca: ['#b79d9e', '#efe0d7'], juntaMolhada: ['#83738b', '#b9a5b1'],
  umidade: ['#c1abb3', '#d2bfc3', '#9d899f'],
  sombraSeca: ['#bca4a8', '#a98e98'],
  sombraMolhada: ['#8b7d94', '#766982'],
  sombraSubmersa: ['#3f5872', '#304762'],
  espuma: ['#8ca7bf', '#edf0e8'], destino: '#4f4f6b',
};
export const pintarConchaRosa                         = (pintar, _nome, x, y) =>
  pintarConchaDoMundo(pintar, 'grutas', x, y);

                           
                                                                                                                     
   
const FORMAS = ['cacho', 'laje', 'arcada', 'lascas']         ;
const GRUTAS = ['arcada', 'gruta_fenda', 'dobra_ametista']         ;

const VAGAS_DA_DOBRA                                                               = {
  'grutas-exp-mapas-na-parede': [486, 148],
  'grutas-exp-alavanca-no-oco': [390, 44],
  'grutas-exp-cisterna-de-areia': [486, 194],
  'grutas-exp-varanda-das-conchas': [2, 6],
  'grutas-exp-rua-dos-refugios': [2, 48],
  'grutas-alavanca-distante': [74, 386],
  'grutas-boca-labirinto': [2, 434],
  'grutas-trio-tres-refugios': [2, 386],
};

const VAGAS_AMETISTA_PEQUENA = new Set([
  'grutas-exp-biblioteca-submersa', 'grutas-exp-coluna-de-vidro', 'grutas-exp-margens-da-fechadura',
  'grutas-exp-ponte-do-diapiro', 'grutas-chefe-cofre-das-espumas',
]);

export function comporGrutas(fase      , quadro              )                       {
  const { largura, altura, origemX } = quadro;
  const esc = Math.floor((origemX - 48) / 2), dir = largura - esc - 48;
  const fim = origemX + fase.mapa[0].length * 48;
  const hash = [...fase.id].reduce((n, v) => (Math.imul(n, 31) + v.charCodeAt(0)) >>> 0, 7);
  const espelho = hash % 2 === 0;
  const lugares = [
    [espelho ? dir : esc, Math.floor(altura * .20) - 24],
    [espelho ? esc : dir, Math.floor(altura * .26) - 24],
    [espelho ? dir : esc, Math.floor(altura * .73) - 24],
  ]         ;
  const rotacao                                  = lugares.map((_, i) => FORMAS[((hash >>> 5) + i) % FORMAS.length]);
  // O paredão com gruta ocupa só uma das três vagas decorativas. Preserve
  // os lugares originais e acrescente a referência mineral onde faltava.
  const vagaDaGruta = rotacao.indexOf('arcada');
  rotacao[vagaDaGruta < 0 ? 1 : vagaDaGruta] = GRUTAS[(hash >>> 11) % GRUTAS.length];
  const locais = lugares.map(([x, y], i)            => ({
    peca: rotacao[i], x, y, largura: 48, altura: 48,
  }));
  // A Dobra mantém as posições validadas na prévia anterior. A visita
  // encontra uma vaga ao redor dela, não desloca a formação de duas casas.
  const reserva = VAGAS_DA_DOBRA[fase.id];
  const naturais = locais.map(e => e.peca === 'dobra_ametista' && reserva
    ? { ...e, x: reserva[0], y: reserva[1], largura: 96 } : e);
  const visita = visitaDaPraia(fase.id, { largura, altura, inicioDaGrade: origemX, fimDaGrade: fim },
    naturais.map(e => ({ ...e, preservar: GRUTAS.some(gruta => e.peca === gruta) })));
  if (!visita) return naturais;
  const base = naturais.map((e, i) => i === visita.indice
    ? { ...e, x: visita.x, y: visita.y, largura: visita.largura, altura: visita.altura, visita } : e);
  // Só use a faixa lateral aberta. Não preencha lacunas estreitas entre
  // casas do tabuleiro; uma sobra de 24 px mantém a água em evidência.
  const vaga = (ocupadas                      , h        , lados                   ) => {
    for (const x of lados) for (let y = altura - h - 18; y >= 18; y -= 2) {
      const ret = { x, y, largura: 48, altura: h };
      if (ocupadas.every(o => x+48+24<=o.x || o.x+o.largura+24<=x
        || y+h+24<=o.y || o.y+o.altura+24<=y)) return ret;
    }
  };
  const concluir = ()                       => {
    if (!VAGAS_AMETISTA_PEQUENA.has(fase.id)) return base;
    const i = base.findIndex(e => !e.visita && (e.peca === 'lascas' || e.peca === 'laje'));
    if (i < 0) throw new Error(`Falta vaga da ametista pequena: ${fase.id}`);
    return base.map((e, j) => j === i ? { ...e, peca: 'ametista_mar' } : e);
  };
  if (altura < 336) return concluir();
  const oposto = visita.x < largura / 2 ? dir : esc;
  const mesmo = oposto === dir ? esc : dir;
  const quarto = vaga(base, 48, [oposto, mesmo]);
  if (!quarto) return concluir();
  base.push({ ...naturais[visita.indice], ...quarto });
  if (altura < 480) return concluir();
  const quinto = vaga(base, 48, [quarto.x === dir ? esc : dir]);
  if (quinto) base.push({ ...quinto, peca: naturais[visita.indice].peca,
    visita: { ...quinto, peca: visita.peca === 'cunha' ? 'gemeas' : 'cunha', indice: 4 } });
  return concluir();
}

/** Pinta o cacho de duas células, irmão da formação menor. */
export function pintarDobraDeAmetista(pintar             , x        , y        )       {
  pintarPecaGrutas(pintar, 'dobra_ametista', x, y);
}

export const ARTE_GRUTAS                         = {
  paleta: PALETA_GRUTAS,
  compor: comporGrutas,
  pintarMar(pintar, fase, quadro, estruturas) {
    pintar(PALETA_GRUTAS.mar, 0, 0, quadro.largura, quadro.altura);
    const rochas = estruturas.flatMap(({ peca, x, y, largura, altura }) =>
      Array.from({ length: (largura / 48) * (altura / 48) }, (_, i) =>
        [peca, x + i % (largura / 48) * 48, y + Math.floor(i / (largura / 48)) * 48]         ));
    for (const [x, y, l, a, tinta] of reduzirReflexos(traçosNoMar(fase.mapa, quadro, rochas), t=>t[4]===0)) {
      if (tinta === 0) pintar(PALETA_GRUTAS.reflexoMar, x, y, l, a);
    }
  },
  pintarEstruturas(pintar, estruturas) {
    for (const { peca, x, y, visita } of estruturas) {
      if (visita) pintarVisitaDaPraia(pintar, visita, PALETA_GRUTAS.espuma);
      else if (peca === 'dobra_ametista') pintarDobraDeAmetista(pintar, x, y);
      else pintarPecaGrutas(pintar, peca, x, y);
    }
  },
  pintarEspumaDasEstruturas(pintar, estruturas, permite) {
    for (const { x, y, visita, peca } of estruturas) {
      if (visita || (peca !== 'dobra_ametista' && peca !== 'ametista_mar')) continue;
      const linhas                                                        =
        peca === 'ametista_mar' ? [[7,38,6,0],[11,39,4,1],[17,41,9,0],[25,40,8,0],[28,41,4,1],[36,38,7,0]] :
        [[11,37,8,0], [15,38,4,1], [24,39,10,0], [33,40,6,0],
          [41,41,12,0], [44,42,5,1], [57,43,9,0], [67,40,11,0], [73,41,5,1],
          [79,38,9,0]];
      for (const [u, v, l, tinta] of linhas) for (let i = 0; i < l; i++)
        if (permite(x + u + i, y + v)) pintar(PALETA_GRUTAS.espuma[tinta], x + u + i, y + v, 1, 1);
      const faixas=linhas.map(([u,v,l,t])=>[x+u,y+v,l,t]);
      for(const [a,b,t] of crescimentoDeFiletesNaBase(faixas,[{x,y,largura:peca==='dobra_ametista'?96:48}],permite))
        if(permite(a,b))pintar(PALETA_GRUTAS.espuma[t==='w'?1:0],a,b,1,1);
    }
  },
  pintarPeca(pintar, nome, x, y) {
    if (nome === 'concha') {
      pintarConchaRosa(pintar, nome, x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, 'concha');
    } else if (nome === 'ostra-aberta' || nome === 'ostra-fechada') {
      pintarPecaPraia(pintar, nome, x, y);
      pintarBrilhosDoObjetivo(pintar, x, y, nome);
    }
    else if (nome === 'banco') {
      pintar(PALETA_GRUTAS.sombraSeca[1], x + 11, y + 24, 27, 11);
      pintar(PALETA_GRUTAS.seca[4], x + 10, y + 18, 27, 13);
      pintar(PALETA_GRUTAS.seca[3], x + 13, y + 17, 22, 8);
      pintar(PALETA_GRUTAS.seca[1], x + 14, y + 17, 17, 2);
      pintar(PALETA_GRUTAS.graos[0], x + 19, y + 23, 2, 2);
      pintar(PALETA_GRUTAS.graos[1], x + 27, y + 25, 2, 2);
    } else pintarPecaPraia(pintar, nome, x, y);
  },
  mecanismos(fase, estado) {
    const bocas = new Map                                                 ();
    for (const par of fase.fendas ?? []) {
      const ativa = fendaAtiva(fase, par, estado.passos);
      for (const boca of par.bocas) {
        if (!bocaSubmersa(fase, boca, estado.passos)) {
          bocas.set(chaveDaCasa(boca), `fenda-${par.forma}-${ativa ? 1 : 0}`);
        }
      }
    }
    const saidas = new Map                 ();
    if (estado.situacao === 'jogando') for (const { movimentos } of preverDirecoesDaEquipe(fase, estado)) {
      for (const m of movimentos) if ('destino' in m && m.fenda) {
        const chave = chaveDaCasa(m.destino);
        saidas.set(chave, !!m.saidaVaiAlagar || saidas.get(chave) === true);
      }
    }
    return { fechados: new Set(), pintar(pintar, posicao, x, y) {
      const chave = chaveDaCasa(posicao);
      const boca = bocas.get(chave);
      if (boca) pintarPecaEnseada(pintar, boca, x, y);
      const alaga = saidas.get(chave);
      if (alaga !== undefined) pintarPecaEnseada(pintar, `saida-fenda-${alaga ? 1 : 0}`, x, y);
    }};
  },
};
export function desenharGrutasPrevias(ctx                          , fase      , estado        ,
  logo                  , fauna                   )       {
  desenharLitoralOficial(ctx, fase, estado, logo, fauna, ARTE_GRUTAS);
}
