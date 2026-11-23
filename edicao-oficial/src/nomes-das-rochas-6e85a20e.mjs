import { pintarEspumaDasEstruturasPraia } from '@@MARE:modulo:src/compor-estruturas-praia-d23b935a.mjs@@';
import { pintarPecaPraia } from '@@MARE:modulo:src/pecas-praia-d4603eb0.mjs@@';
                                                              
                                                           

export const NOMES_DAS_ROCHAS = {
  cunha: 'Cunha', gemeas: 'Trio de pedras', espigao: 'Trio vertical',
}         ;
                                                               

// Participações pontuais da Praia, espalhadas no começo, meio e fim de cada
// mundo. IDs tornam a escolha estável em ambas as marés e fora do Improviso.
export const ROCHAS_EM_VISITA                                                        = {
  'recife-pedra-firme': 'cunha',
  'recifes-exp-arco-do-coral': 'cunha',
  'recifes-exp-ponte-em-zigue': 'gemeas',
  'recifes-exp-ombro-do-costao': 'espigao',
  'recife-duas-pocas': 'gemeas',
  'recifes-exp-meia-volta-de-nacre': 'cunha',
  'recifes-exp-bacia-estreita': 'espigao',
  'recifes-exp-poco-do-ourico': 'gemeas',
  'recife-retorno': 'espigao',
  'recifes-exp-volta-das-fendas': 'cunha',
  'recifes-exp-porta-do-norte': 'gemeas',
  'recifes-exp-costura-de-sal': 'espigao',
  'recife-degraus': 'gemeas',
  'recifes-exp-ilhas-de-vies': 'cunha',
  'recife-janelas': 'espigao',
  'recifes-exp-anel-da-concha': 'cunha',
  'recife-pedra-oco': 'gemeas',
  'recife-volta-costao': 'espigao',
  'recife-pocas-suspensas': 'espigao',
  'recifes-exp-margens-de-tres': 'cunha',
  'recife-cintura': 'gemeas',
  'recifes-exp-triangulo-do-baixio': 'espigao',
  'recifes-exp-saida-apos-espuma': 'espigao',
  'recife-tres-aneis': 'gemeas',
  'recifes-exp-coroa-da-vazante': 'cunha',
  'recife-fio-coral': 'cunha',
  'recife-mosaico': 'gemeas',
  'recife-chefe-guardiao-das-pocas': 'gemeas',
  'recife-chefe-vigia-do-recife': 'cunha',
  'mangue-dois-encontros': 'cunha',
  'mangue-exp-ramos-curvados': 'cunha',
  'mangue-exp-fenda-das-raizes': 'gemeas',
  'mangue-placa': 'espigao',
  'mangue-exp-placa-na-quina': 'espigao',
  'mangue-reuniao': 'gemeas',
  'mangue-duas-veredas': 'cunha',
  'mangue-exp-ilhas-de-dois-passos': 'gemeas',
  'mangue-janela-partilhada': 'espigao',
  'mangue-exp-grampos-de-areia': 'cunha',
  'mangue-exp-lacada-do-lodo': 'cunha',
  'mangue-trinco-salgado': 'gemeas',
  'mangue-exp-porta-de-costas': 'espigao',
  'mangue-exp-vigilia-do-trinco': 'gemeas',
  'mangue-fragmentos-cruzados': 'cunha',
  'mangue-exp-siri-nas-bifurcacoes': 'espigao',
  'mangue-exp-coroa-de-lodo': 'gemeas',
  'mangue-cotovelo': 'cunha',
  'mangue-exp-nicho-de-cruzamento': 'gemeas',
  'mangue-porteira-encontro': 'espigao',
  'mangue-exp-raiz-que-fica': 'cunha',
  'mangue-exp-meia-volta-na-placa': 'cunha',
  'mangue-raizes-em-circuito': 'espigao',
  'mangue-exp-galeria-das-sementes': 'gemeas',
  'mangue-exp-manguezal-em-espiral': 'espigao',
  'mangue-chefe-guardiao-da-raiz': 'gemeas',
  'mangue-chefe-dupla-no-mangue': 'espigao',
  'enseada-sombra-restinga': 'cunha',
  'enseada-exp-onda-no-degrau': 'cunha',
  'enseada-exp-areia-em-forquilha': 'gemeas',
  'enseada-abrigo-ondas': 'espigao',
  'enseada-exp-escadinha-da-restinga': 'cunha',
  'enseada-farol-baixo': 'espigao',
  'enseada-exp-posto-da-vigia': 'gemeas',
  'enseada-dupla-vigia': 'espigao',
  'enseada-dupla-revezamento': 'cunha',
  'enseada-passo-sombra': 'gemeas',
  'enseada-exp-no-vai-e-vem': 'espigao',
  'enseada-vigia-das-pedras': 'cunha',
  'enseada-exp-margem-em-anel': 'gemeas',
  'enseada-escolha-de-margem': 'espigao',
  'enseada-exp-ilha-da-sombra-curta': 'cunha',
  'enseada-exp-degraus-do-bico': 'gemeas',
  'enseada-fragmento-do-bico': 'espigao',
  'enseada-exp-ponta-da-restinga-oeste': 'cunha',
  'enseada-fresta-da-vazante': 'gemeas',
  'enseada-exp-cais-fora-da-sombra': 'espigao',
  'enseada-exp-triangulo-da-vazante': 'cunha',
  'enseada-ecos-do-rasante': 'gemeas',
  'enseada-exp-rosa-dos-ventos': 'gemeas',
  'enseada-exp-folha-sobre-a-agua': 'espigao',
  'enseada-exp-dois-olhares': 'gemeas',
  'enseada-vigia-partilhada': 'cunha',
  'enseada-exp-entrelace-da-restinga': 'espigao',
  'enseada-chefe-garca-da-restinga': 'gemeas',
  'enseada-chefe-vigia-das-falesias': 'cunha',
  'enseada-fenda-entre-rochas': 'espigao',
  'enseada-fenda-da-vazante': 'gemeas',
  'deriva-primeira-balsa': 'cunha',
  'deriva-exp-calheta': 'gemeas',
  'deriva-exp-cais-suspenso': 'espigao',
  'deriva-exp-vazante': 'gemeas',
  'deriva-exp-pedra-em-meia-lua': 'espigao',
  'deriva-duas-margens': 'cunha',
  'deriva-exp-dente-do-cais': 'gemeas',
  'deriva-exp-alca-salgada': 'cunha',
  'deriva-corrente-cruzada': 'espigao',
  'deriva-exp-dois-bracos-de-pedra': 'gemeas',
  'deriva-exp-dunas-trocadas': 'cunha',
  'deriva-exp-correntes-em-l': 'cunha',
  'deriva-exp-bifurcacao-safira': 'espigao',
  'deriva-exp-escada-das-tres-ilhas': 'gemeas',
  'deriva-exp-ultimas-estacas': 'espigao',
  'deriva-exp-guarda-do-canal': 'cunha',
  'deriva-exp-placa-na-ilhota': 'espigao',
  'deriva-exp-retorno-em-revezamento': 'gemeas',
  'deriva-dupla-cais': 'cunha',
  'deriva-dupla-contramao': 'espigao',
  'deriva-um-passo-ao-cais': 'cunha',
  'deriva-cais-da-alta': 'gemeas',
  'deriva-duas-rampas': 'espigao',
  'deriva-balsas-alternadas': 'gemeas',
  'deriva-ida-e-retorno': 'cunha',
  'deriva-dois-ancoradouros': 'gemeas',
  'deriva-tripulacao-partilhada': 'espigao',
  'deriva-chefe-mestre-das-correntes': 'cunha',
  'deriva-chefe-passagem-das-balsas': 'gemeas',
  'grutas-encaixe': 'cunha',
  'grutas-exp-perola-no-mezanino': 'cunha',
  'grutas-exp-biblioteca-submersa': 'gemeas',
  'grutas-exp-coluna-de-vidro': 'espigao',
  'grutas-ordem': 'cunha',
  'grutas-exp-mapas-na-parede': 'gemeas',
  'grutas-exp-alavanca-no-oco': 'espigao',
  'grutas-retorno': 'cunha',
  'grutas-exp-cisterna-de-areia': 'gemeas',
  'grutas-exp-perola-em-ziguezague': 'gemeas',
  'grutas-exp-varanda-das-conchas': 'cunha',
  'grutas-dupla-portao': 'espigao',
  'grutas-exp-margens-da-fechadura': 'espigao',
  'grutas-exp-entre-estalactites': 'gemeas',
  'grutas-exp-rua-dos-refugios': 'cunha',
  'grutas-dupla-camaras': 'espigao',
  'grutas-exp-claraboia-partilhada': 'gemeas',
  'grutas-exp-galerias-em-espelho': 'espigao',
  'grutas-exp-ponte-do-diapiro': 'cunha',
  'grutas-exp-agulha-da-vazante': 'cunha',
  'grutas-alavanca-da-entrada': 'gemeas',
  'grutas-dobra-da-camara': 'espigao',
  'grutas-coral-portador': 'cunha',
  'grutas-alavanca-distante': 'gemeas',
  'grutas-boca-labirinto': 'espigao',
  'grutas-trio-tres-refugios': 'gemeas',
  'grutas-chefe-sentinela-da-gruta': 'espigao',
  'grutas-chefe-cofre-das-espumas': 'espigao',
  'ressaca-dupla-abrigo': 'cunha',
  'ressaca-exp-dobras': 'cunha',
  'ressaca-dupla-ancoradouros': 'gemeas',
  'ressaca-exp-corredores': 'espigao',
  'ressaca-refugio-de-pedra': 'espigao',
  'ressaca-exp-leques': 'gemeas',
  'ressaca-bolsos-opostos': 'cunha',
  'ressaca-exp-mastro': 'gemeas',
  'ressaca-vigia-da-placa': 'espigao',
  'ressaca-exp-revezamento': 'cunha',
  'ressaca-balsas-da-ponta': 'gemeas',
  'ressaca-exp-cotovelo': 'espigao',
  'ressaca-exp-pontal': 'gemeas',
  'ressaca-cais-em-paralelo': 'cunha',
  'ressaca-exp-balizas': 'espigao',
  'ressaca-tres-moedas-do-cais': 'gemeas',
  'ressaca-exp-coroa': 'cunha',
  'ressaca-atracadouro-torto': 'espigao',
  'ressaca-exp-ondas': 'gemeas',
  'ressaca-exp-argolas': 'cunha',
  'ressaca-cofre-da-vazante': 'espigao',
  'ressaca-exp-flutuantes': 'espigao',
  'ressaca-exp-boias': 'cunha',
  'ressaca-exp-laminas': 'cunha',
  'ressaca-exp-rebentacao': 'gemeas',
  'ressaca-trio-eco-dos-tres-cais': 'espigao',
  'ressaca-chefe-vento-sul': 'gemeas',
  'ressaca-chefe-ressaca-alta': 'gemeas',
  'farol-fragmento-margens': 'gemeas',
  'farol-exp-sinos': 'cunha',
  'farol-duas-luzes': 'espigao',
  'farol-exp-lastros': 'gemeas',
  'farol-faroleiros-de-vigia': 'gemeas',
  'farol-exp-sentinelas': 'espigao',
  'farol-turno-dos-guardioes': 'cunha',
  'farol-exp-prumos': 'espigao',
  'farol-costa-das-tres-luzes': 'gemeas',
  'farol-exp-bolsao': 'cunha',
  'farol-faisca-de-entrada': 'gemeas',
  'farol-exp-agulha': 'espigao',
  'farol-exp-janelas': 'cunha',
  'farol-salao-das-lanternas': 'cunha',
  'farol-exp-cadeado': 'gemeas',
  'farol-quatro-cais': 'espigao',
  'farol-exp-charneira': 'cunha',
  'farol-lentes-em-contramare': 'espigao',
  'farol-exp-quadrante': 'gemeas',
  'farol-exp-prisma': 'cunha',
  'farol-exp-tripode': 'espigao',
  'farol-exp-ampulheta': 'cunha',
  'farol-exp-ocaso': 'gemeas',
  'farol-exp-poente': 'espigao',
  'farol-luz-das-duas-mares': 'cunha',
  'farol-chefe-guardiao': 'gemeas',
  'farol-chefe-ultima-virada': 'espigao',
  'farol-trio-tres-luzes': 'cunha',
};

                                                                         
                                                                                               
                                                                                                      

function separadas(a           , b           )          {
  const margem = 4;
  return a.x + a.largura + margem <= b.x || b.x + b.largura + margem <= a.x
    || a.y + a.altura + margem <= b.y || b.y + b.altura + margem <= a.y;
}

export function visitaDaPraia(id        , costa       , rochas                         )                            {
  // A semente do Improviso define a visita sem alterar a sorte do puzzle.
  const pecas = ['cunha', 'gemeas', 'espigao'];
  const peca = ROCHAS_EM_VISITA[id] ?? (id.startsWith('mare-a-mao-')
    ? pecas[[...id].reduce((valor, letra) => (valor * 31 + letra.charCodeAt(0)) >>> 0, 0) % pecas.length]
    : undefined);
  if (!peca) return;
  const largura = 48, altura = peca === 'espigao' ? 96 : 48;
  const ficaNoMar = (x        ) => x >= 0 && x + largura <= costa.largura
    && (x + largura <= costa.inicioDaGrade || x >= costa.fimDaGrade);
  for (let indice = rochas.length - 1; indice >= 0; indice--) {
    const anterior = rochas[indice];
    if (anterior.preservar) continue;
    const centro = anterior.x + anterior.largura / 2;
    const preferida = centro < costa.largura / 2 ? 0 : 1;
    const margens = [Math.floor((costa.inicioDaGrade - largura) / 2),
      Math.floor((costa.largura + costa.fimDaGrade - largura) / 2)];
    const xs = [Math.round(centro - largura / 2), margens[preferida], margens[1 - preferida]];
    const y0 = Math.max(0, Math.min(costa.altura - altura,
      Math.round(anterior.y + (anterior.altura - altura) / 2)));
    for (const x of xs) {
      if (!ficaNoMar(x)) continue;
      for (let raio = 0; raio <= costa.altura; raio++) {
        for (const y of raio ? [y0 - raio, y0 + raio] : [y0]) {
          if (y < 0 || y + altura > costa.altura) continue;
          const visita = { peca, indice, x, y, largura, altura };
          if (rochas.every((r, i) => i === indice || separadas(visita, r))) return visita;
        }
      }
    }
  }
  // Em tabuleiros panorâmicos pode sobrar apenas a faixa lateral de 16 px.
  // A miniatura cabe no lugar de uma pedra existente, sem encolher a grade.
  const divisor = 4;
  const larguraMini = largura / divisor, alturaMini = altura / divisor;
  for (let indice = rochas.length - 1; indice >= 0; indice--) {
    const anterior = rochas[indice];
    if (anterior.preservar) continue;
    const x = Math.round(anterior.x + (anterior.largura - larguraMini) / 2);
    const y = Math.round(anterior.y + (anterior.altura - alturaMini) / 2);
    const cabe = x >= 0 && x + larguraMini <= costa.largura
      && (x + larguraMini <= costa.inicioDaGrade || x >= costa.fimDaGrade)
      && y >= 0 && y + alturaMini <= costa.altura;
    const miniatura = { peca, indice, x, y, largura: larguraMini, altura: alturaMini, divisor };
    if (cabe && rochas.every((r, i) => i === indice || separadas(miniatura, r))) return miniatura;
  }
}

export function pintarVisitaDaPraia(pintar             , visita                           ,
  espuma                            ,
)       {
  if (!visita) return;
  const { x, y, largura, altura, peca, divisor } = visita;
  if (divisor) {
    // Vizinho mais próximo: amostra o centro do bloco, sem mistura de tintas.
    const centro = divisor / 2;
    pintarPecaPraia((cor, u, v, l, a) => {
      for (let j = v; j < v + a; j++) for (let i = u; i < u + l; i++) {
        if (i % divisor === centro && j % divisor === centro)
          pintar(cor, x + Math.floor(i / divisor), y + Math.floor(j / divisor), 1, 1);
      }
    }, peca, 0, 0);
    return;
  }
  const ocupados = new Set        ();
  let topo = altura, base = 0;
  pintarPecaPraia((cor, u, v, l, a) => {
    pintar(cor, u, v, l, a);
    if (!espuma) return;
    topo = Math.min(topo, v - y);
    base = Math.max(base, v - y + a);
    for (let j = 0; j < a; j++) for (let i = 0; i < l; i++)
      ocupados.add((v - y + j) * largura + (u - x + i));
  }, peca, x, y);
  if (!espuma) return;
  // A forma do filete é a oficial da Praia. O corte inferior evita espuma
  // na face da rocha; as cores mantêm o parentesco com o oceano local.
  pintarEspumaDasEstruturasPraia(pintar, [visita], (u, v) =>
    u >= x && u < x + largura && v >= y + Math.ceil((topo + base) / 2)
    && v < y + altura && !ocupados.has((v - y) * largura + u - x), espuma);
}

// A área livre é calculada em coordenadas nativas, sem recortar a grade.
const grauDaVisita = (id) => [...id].reduce((h, letra) => (h * 31 + letra.charCodeAt(0)) >>> 0, 0);
const PECAS_DE_RESPIRO = ['seixo', 'bloco', 'cunha', 'gemeas', 'espigao'];

function intervaloEntreRochas(a, b) {
  return Math.max(a.x - b.x - b.largura, b.x - a.x - a.largura,
    a.y - b.y - b.altura, b.y - a.y - a.altura);
}

export function rochaComRespiro(id, costa, locais, peca, folga) {
  const largura = 48, altura = peca === 'espigao' ? 96 : 48;
  const borda = 2;
  const lados = [
    [borda, costa.inicioDaGrade - largura - borda],
    [costa.fimDaGrade + borda, costa.largura - largura - borda],
  ];
  let melhor, valor = -Infinity;
  for (const [min, max] of lados) {
    if (min > max) continue;
    const x = Math.floor((min + max) / 2);
    for (let y = 10; y + altura + 10 <= costa.altura; y += 2) {
      const r = { peca, x, y, largura, altura, indice: locais.length };
      const respiro = Math.min(...locais.map(l => intervaloEntreRochas(l, r)));
      if (respiro < folga) continue;
      const bordaVertical = Math.min(y, costa.altura - y - altura);
      // Coloca a peça no maior silêncio marinho. O desempate varia por fase.
      const nota = Math.min(respiro, 116) + Math.min(bordaVertical, 36) * .35
        + ((x * 17 + y * 19 + grauDaVisita(id)) % 29) / 100;
      if (nota > valor) {
        melhor = r;
        valor = nota;
      }
    }
  }
  return melhor;
}

export function comporVisitasDaPraia(id, costa, locais) {
  const antiga = visitaDaPraia(id, costa, locais);
  if (!antiga) return [];
  const primeira = rochaComRespiro(id, costa, locais, antiga.peca, 16);
  if (!primeira) return [antiga];
  const visitas = [primeira];
  // Uma quinta peça é excepcional: só em duas margens amplas num quadro alto.
  if (costa.altura < 340 || Math.min(costa.inicioDaGrade, costa.largura - costa.fimDaGrade) < 52
    || grauDaVisita(id) % 7 !== 0) return visitas;
  const outras = PECAS_DE_RESPIRO.filter(peca => peca !== primeira.peca);
  const ocupadas = [...locais, primeira];
  const extra = rochaComRespiro(id, costa, ocupadas, outras[grauDaVisita(id) % outras.length], 34);
  if (extra) visitas.push(extra);
  return visitas;
}

export function comporExtrasDaPraia(id, costa, locais) {
  if (costa.altura < 248) return [];
  const peca = PECAS_DE_RESPIRO[grauDaVisita(id) % PECAS_DE_RESPIRO.length];
  const unica = rochaComRespiro(id, costa, locais, peca, 22);
  return unica ? [unica] : [];
}
