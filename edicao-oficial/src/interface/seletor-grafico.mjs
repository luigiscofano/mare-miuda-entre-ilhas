// Apenas a ordem aprovada é armazenada aqui. Estados e portais vêm do jogo.
const CATALOGO = {"recifes":{"nome":"Recifes Expostos","numero":2,"total":29,"paginas":[["recife-pedra-firme","recifes-exp-arco-do-coral","recifes-exp-ponte-em-zigue","recifes-exp-ombro-do-costao","recife-duas-pocas","recifes-exp-meia-volta-de-nacre","recifes-exp-bacia-estreita","recifes-exp-poco-do-ourico"],["recife-retorno","recifes-exp-volta-das-fendas","recifes-exp-porta-do-norte","recifes-exp-costura-de-sal","recife-degraus","recifes-exp-ilhas-de-vies","recife-janelas","recifes-exp-anel-da-concha"],["recife-pedra-oco","recife-volta-costao","recife-pocas-suspensas","recifes-exp-margens-de-tres","recife-cintura","recifes-exp-triangulo-do-baixio","recifes-exp-saida-apos-espuma","recife-tres-aneis"],["recifes-exp-coroa-da-vazante","recife-fio-coral","recife-mosaico","recife-chefe-guardiao-das-pocas","recife-chefe-vigia-do-recife"]]},"mangue":{"nome":"Mangue dos Siris Duplos","numero":3,"total":27,"paginas":[["mangue-dois-encontros","mangue-exp-ramos-curvados","mangue-exp-fenda-das-raizes","mangue-placa","mangue-exp-placa-na-quina","mangue-reuniao","mangue-duas-veredas","mangue-exp-ilhas-de-dois-passos"],["mangue-janela-partilhada","mangue-exp-grampos-de-areia","mangue-exp-lacada-do-lodo","mangue-trinco-salgado","mangue-exp-porta-de-costas","mangue-exp-vigilia-do-trinco","mangue-fragmentos-cruzados","mangue-exp-siri-nas-bifurcacoes"],["mangue-exp-coroa-de-lodo","mangue-cotovelo","mangue-exp-nicho-de-cruzamento","mangue-porteira-encontro","mangue-exp-raiz-que-fica","mangue-exp-meia-volta-na-placa","mangue-raizes-em-circuito","mangue-exp-galeria-das-sementes"],["mangue-exp-manguezal-em-espiral","mangue-chefe-guardiao-da-raiz","mangue-chefe-dupla-no-mangue"]]},"enseada":{"nome":"Enseada da Garça","numero":4,"total":31,"paginas":[["enseada-sombra-restinga","enseada-exp-onda-no-degrau","enseada-exp-areia-em-forquilha","enseada-abrigo-ondas","enseada-exp-escadinha-da-restinga","enseada-farol-baixo","enseada-exp-posto-da-vigia","enseada-dupla-vigia"],["enseada-dupla-revezamento","enseada-passo-sombra","enseada-exp-no-vai-e-vem","enseada-vigia-das-pedras","enseada-exp-margem-em-anel","enseada-escolha-de-margem","enseada-exp-ilha-da-sombra-curta","enseada-exp-degraus-do-bico"],["enseada-fragmento-do-bico","enseada-exp-ponta-da-restinga-oeste","enseada-fresta-da-vazante","enseada-exp-cais-fora-da-sombra","enseada-exp-triangulo-da-vazante","enseada-ecos-do-rasante","enseada-exp-rosa-dos-ventos","enseada-exp-folha-sobre-a-agua"],["enseada-exp-dois-olhares","enseada-vigia-partilhada","enseada-exp-entrelace-da-restinga","enseada-chefe-garca-da-restinga","enseada-chefe-vigia-das-falesias","enseada-fenda-entre-rochas","enseada-fenda-da-vazante"]]},"deriva":{"nome":"Ilhas à Deriva","numero":5,"total":29,"paginas":[["deriva-primeira-balsa","deriva-exp-calheta","deriva-exp-cais-suspenso","deriva-exp-vazante","deriva-exp-pedra-em-meia-lua","deriva-duas-margens","deriva-exp-dente-do-cais","deriva-exp-alca-salgada"],["deriva-corrente-cruzada","deriva-exp-dois-bracos-de-pedra","deriva-exp-dunas-trocadas","deriva-exp-correntes-em-l","deriva-exp-bifurcacao-safira","deriva-exp-escada-das-tres-ilhas","deriva-exp-ultimas-estacas","deriva-exp-guarda-do-canal"],["deriva-exp-placa-na-ilhota","deriva-exp-retorno-em-revezamento","deriva-dupla-cais","deriva-dupla-contramao","deriva-um-passo-ao-cais","deriva-cais-da-alta","deriva-duas-rampas","deriva-balsas-alternadas"],["deriva-ida-e-retorno","deriva-dois-ancoradouros","deriva-tripulacao-partilhada","deriva-chefe-mestre-das-correntes","deriva-chefe-passagem-das-balsas"]]},"grutas":{"nome":"Grutas da Espuma","numero":6,"total":28,"paginas":[["grutas-encaixe","grutas-exp-perola-no-mezanino","grutas-exp-biblioteca-submersa","grutas-exp-coluna-de-vidro","grutas-ordem","grutas-exp-mapas-na-parede","grutas-exp-alavanca-no-oco","grutas-retorno"],["grutas-exp-cisterna-de-areia","grutas-exp-perola-em-ziguezague","grutas-exp-varanda-das-conchas","grutas-dupla-portao","grutas-exp-margens-da-fechadura","grutas-exp-entre-estalactites","grutas-exp-rua-dos-refugios","grutas-dupla-camaras"],["grutas-exp-claraboia-partilhada","grutas-exp-galerias-em-espelho","grutas-exp-ponte-do-diapiro","grutas-exp-agulha-da-vazante","grutas-alavanca-da-entrada","grutas-dobra-da-camara","grutas-coral-portador","grutas-alavanca-distante"],["grutas-boca-labirinto","grutas-trio-tres-refugios","grutas-chefe-sentinela-da-gruta","grutas-chefe-cofre-das-espumas"]]},"ressaca":{"nome":"Baía das Brasas","numero":7,"total":28,"paginas":[["ressaca-dupla-abrigo","ressaca-exp-dobras","ressaca-dupla-ancoradouros","ressaca-exp-corredores","ressaca-refugio-de-pedra","ressaca-exp-leques","ressaca-bolsos-opostos","ressaca-exp-mastro"],["ressaca-vigia-da-placa","ressaca-exp-revezamento","ressaca-balsas-da-ponta","ressaca-exp-cotovelo","ressaca-exp-pontal","ressaca-cais-em-paralelo","ressaca-exp-balizas","ressaca-tres-moedas-do-cais"],["ressaca-exp-coroa","ressaca-atracadouro-torto","ressaca-exp-ondas","ressaca-exp-argolas","ressaca-cofre-da-vazante","ressaca-exp-flutuantes","ressaca-exp-boias","ressaca-exp-laminas"],["ressaca-exp-rebentacao","ressaca-trio-eco-dos-tres-cais","ressaca-chefe-vento-sul","ressaca-chefe-ressaca-alta"]]},"farol":{"nome":"Arquipélago do Farol","numero":8,"total":28,"paginas":[["farol-fragmento-margens","farol-exp-sinos","farol-duas-luzes","farol-exp-lastros","farol-faroleiros-de-vigia","farol-exp-sentinelas","farol-turno-dos-guardioes","farol-exp-prumos"],["farol-costa-das-tres-luzes","farol-exp-bolsao","farol-faisca-de-entrada","farol-exp-agulha","farol-exp-janelas","farol-salao-das-lanternas","farol-exp-cadeado","farol-quatro-cais"],["farol-exp-charneira","farol-lentes-em-contramare","farol-exp-quadrante","farol-exp-prisma","farol-exp-tripode","farol-exp-ampulheta","farol-exp-ocaso","farol-exp-poente"],["farol-luz-das-duas-mares","farol-chefe-guardiao","farol-chefe-ultima-virada","farol-trio-tres-luzes"]]}};
const ordemDaPraia = [
  "primeira-onda",
  "praia-exp-ramal-da-duna",
  "praia-exp-degrau-da-vazante",
  "praia-exp-poquinha-do-sul",
  "praia-exp-pescoco-de-areia",
  "sombra-da-garca",
  "praia-exp-curva-da-restinga",
  "praia-exp-mira-na-entrada",
  "busca-e-volta",
  "praia-exp-duas-beiras",
  "praia-exp-ilha-do-nacre",
  "praia-exp-janela-do-farolete",
  "ilhota-perolada",
  "ponta-da-garca",
  "praia-exp-contorno-da-enseada",
  "praia-exp-garca-do-pontal",
  "praia-fio-de-areia",
  "praia-exp-encontro-de-lagoas",
  "praia-exp-orla-dos-refugios",
  "praia-chefe-vigia-das-ondas",
  "praia-chefe-ponta-da-ressaca",
  "praia-pocas-espelho",
  "praia-exp-ilhas-em-triangulo",
  "praia-exp-linha-do-sernambi",
  "praia-mirante",
  "praia-exp-garca-da-vazante",
  "praia-exp-duas-luzes-do-cabo",
  "praia-exp-asa-sobre-areia",
  "praia-bolso-mare",
  "praia-trilha-das-pedras",
  "praia-fragmentos-areal"
];
CATALOGO.praia = {
  numero:1, nome:'Praia das Conchas', total:ordemDaPraia.length,
  paginas:Array.from({length:4},(_,i)=>ordemDaPraia.slice(i*8,i*8+8)),
};
const nomesEstado = { bloqueada: 'Bloqueada', disponivel: 'Disponível', concluida: 'Concluída' };
const nomesTipo = { regular: 'Travessia', bonus: 'Bônus', chefe: 'Chefe opcional', viagem: 'Viagem' };
export const ehSeletorDaPraia = mundo => mundo === 'praia' || mundo === 'praia-enseadinha';
export function seletorGraficoPara(mundo) {
  return ehSeletorDaPraia(mundo) ? 'praia' : Object.hasOwn(CATALOGO,mundo) ? mundo : undefined;
}
export function idDaFaseSeguinte(mundo,id) {
  const ordem=CATALOGO[mundo]?.paginas.flat() ?? [];
  const k=ordem.indexOf(id);
  return k<0?undefined:ordem[k+1];
}
export function totalDePaginas(mundo) { return CATALOGO[mundo].paginas.length; }
export function paginaDaFase(mundo,id) {
  const i = CATALOGO[mundo].paginas.findIndex(pagina=>pagina.includes(id));
  return i < 0 ? undefined : i;
}

/** As duas regiões só se encontram pelos portais já previstos no motor. */
export function regioesDaPraia(p, { opcoesDoSeletor, selecionarMarco, viajar, mundoAtual }) {
  const atual = mundoAtual(p);
  const outro = atual === 'praia' ? 'praia-enseadinha' : 'praia';
  const passagem = opcoesDoSeletor(p).find(o => o.destino === outro);
  const acao = passagem && selecionarMarco(p, passagem.id);
  const proximo = acao && viajar(acao.progresso, outro);
  const podeCruzar = !!proximo && proximo !== acao.progresso;
  const opcoesAtuais = opcoesDoSeletor(p).map(o => ({ ...o, origem: atual }));
  const opcoesOutra = opcoesDoSeletor(podeCruzar ? proximo : { ...p, mundo: outro })
    .map(o => ({ ...o, origem: outro, ...(podeCruzar ? {} : {
      estado: 'bloqueada', motivo: passagem?.motivo ?? 'Libere a passagem para a outra região da praia.',
    }) }));
  return { opcoes: [...opcoesAtuais, ...opcoesOutra], progressoPara: origem => origem === atual ? p : podeCruzar ? proximo : undefined };
}

function elemento(doc, tipo, classe, texto) {
  const no = doc.createElement(tipo);
  if (classe) no.className = classe;
  if (texto) no.textContent = texto;
  return no;
}
function rotuloDaOpcao(o, numero) {
  return [numero === undefined ? undefined : `Fase ${numero}`, o.nome, nomesTipo[o.categoria],
    nomesEstado[o.estado], o.motivo].filter(Boolean).join('. ');
}
function cartao(doc, o, numero, ativar) {
  const b = elemento(doc,'button','praia-direta-card');
  b.type = 'button';
  b.dataset.marco = o.id;
  b.dataset.estado = o.estado;
  b.dataset.categoria = o.categoria;
  b.setAttribute('aria-label', rotuloDaOpcao(o, numero));
  if (o.estado === 'bloqueada') {
    b.setAttribute('aria-disabled','true');
    if (o.motivo) b.setAttribute('title',o.motivo);
  } else b.addEventListener('click', () => ativar(o.id, o.origem));
  const n = elemento(doc,'span','praia-direta-numero',String(numero).padStart(2,'0'));
  const nome = elemento(doc,'span','praia-direta-nome',o.nome);
  b.append(n,nome);
  return b;
}
function seta(doc,direcao,ativa,mudar) {
  const voltar=direcao==='anterior';
  const b = elemento(doc,'button','praia-direta-seta');
  b.type='button'; b.dataset.paginaPraia=direcao;
  b.setAttribute('aria-label',voltar?'Página anterior':'Próxima página');
  b.disabled=!ativa;
  b.addEventListener('click',()=>mudar(voltar?-1:1));
  return b;
}
export function desenharSeletorGrafico(doc, painel, { opcoes, pagina, mundo, ativar, mudarPagina }) {
  const {paginas,numero,total,nome}=CATALOGO[mundo];
  const totalPaginas=paginas.length;
  painel.setAttribute('data-seletor-praia','');
  painel.setAttribute('data-tema',mundo);
  const mapa = new Map(opcoes.map(o=>[o.id,o]));
  const palco = elemento(doc,'div','praia-direta-palco');
  palco.setAttribute('data-pagina',String(pagina+1));
  palco.setAttribute('data-mundo',mundo);
  const chamada = elemento(doc,'p','praia-direta-mundo',`Mundo ${numero} / ${total} fases`);
  chamada.setAttribute('tabindex','-1');
  chamada.setAttribute('aria-label',`${nome}. Mundo ${numero}. ${total} fases.`);
  palco.append(chamada);
  const grade = elemento(doc,'div','praia-direta-grade');
  const primeiro = paginas.slice(0,pagina).reduce((n,p)=>n+p.length,0);
  paginas[pagina].forEach((id,i) => {
    const o = mapa.get(id);
    if (!o) return;
    const botao = cartao(doc,o,primeiro+i+1,ativar);
    botao.setAttribute('style', `--coluna:${i%2};--linha-desktop:${Math.floor(i/2)};--linha-mobile:${i}`);
    grade.append(botao);
  });
  palco.append(grade);
  const rodape = elemento(doc,'div','praia-direta-paginacao');
  const indicador = elemento(doc,'p','praia-direta-pagina',`Página ${pagina+1} / ${totalPaginas}`);
  indicador.setAttribute('tabindex','-1');
  const pontos = elemento(doc,'span','praia-direta-pontos');
  pontos.setAttribute('aria-hidden','true');
  for(let i=0;i<totalPaginas;i++){
    const ponto=elemento(doc,'i',i===pagina?'atual':'');
    pontos.append(ponto);
  }
  rodape.append(seta(doc,'anterior',pagina>0,mudarPagina),indicador,pontos,
    seta(doc,'proxima',pagina<totalPaginas-1,mudarPagina));
  palco.append(rodape);
  // As saídas continuam disponíveis pelo caminho e pelas condições originais.
  const viagens = elemento(doc,'div','praia-direta-viagens');
  for(const o of opcoes.filter(o=>mundo==='praia' ? o.destino==='arquipelago' : !!o.destino)){
    const b=elemento(doc,'button','',o.nome);
    b.type='button'; b.dataset.marco=o.id;
    b.setAttribute('aria-label',rotuloDaOpcao(o));
    if(o.estado==='bloqueada'){
      b.setAttribute('aria-disabled','true');
      if(o.motivo)b.setAttribute('title',o.motivo);
    }else b.addEventListener('click',()=>ativar(o.id,o.origem));
    viagens.append(b);
  }
  painel.replaceChildren(palco,viagens);
}
