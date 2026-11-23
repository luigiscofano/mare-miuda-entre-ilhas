import { GUARDIAO_DA_RAIZ, DUPLA_NO_MANGUE, PONTA_DA_RESSACA, GUARDIAO_DAS_POCAS, VIGIA_DO_RECIFE, VIGIA_DAS_ONDAS, GARCA_DA_RESTINGA, VIGIA_DAS_FALESIAS, ULTIMA_VIRADA, ECO_DOS_TRES_CAIS, TRES_LUZES_EM_REVEZAMENTO, TRES_REFUGIOS, GUARDIAO_FAROL, RESSACA_ALTA, VENTO_SUL, FASES_RESSACA_AMPLIADA, FASES_GRUTAS_AMPLIADAS, SENTINELA_DA_GRUTA, COFRE_DAS_ESPUMAS, MESTRE_DAS_CORRENTES, PASSAGEM_DAS_BALSAS, FASES_DERIVA_AMPLIADA, FASES_ENSEADA_AMPLIADA, FASES_MANGUE_AMPLIADO, FASES_RECIFES_AMPLIADOS, FASES_FAROL_AMPLIADO } from '@@MARE:modulo:src/campanha/fichas/marcos.mjs@@';
import { faseDaCampanha } from '@@MARE:modulo:src/fases-d5b7ec17.mjs@@';
import { FENDAS_DA_ENSEADA } from '@@MARE:modulo:src/campanha/fichas/desvios.mjs@@';
import { IDS_DA_EXPANSAO } from '@@MARE:modulo:src/expansao-5dd97c18.mjs@@';
                                                                   
                                                                          
                                                                          
                                                                        
                                                                          
                                                                        
                                                                            
                                                                      
import { mesmaCasa } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                          

                                                                                             
                                                                              
                                                                                                                                          
                                                                                                                                                                                                                                                                                                           
                                                               
                                                                                                        
                                                                              
                                                                               
                                                        
                                                                                                          
                                                              
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                
                                  
                   
                                
                
                       
   
                         
                                                                                                                                                                                                          
                   
               
                     
                  
                  
   
const P = (coluna        , linha        )          => ({ coluna, linha });
const CAIS          = { coluna: 1, linha: 1 };
const ENTRADAS_PRAIA                     = [
  { id: 'primeira-onda', nome: 'Primeira onda', posicao: { coluna: 2, linha: 1 } },
  { id: 'sombra-da-garca', nome: 'Sombra da garça', posicao: { coluna: 4, linha: 1 } },
  { id: 'busca-e-volta', nome: 'Busca e volta', posicao: { coluna: 6, linha: 1 } },
  { id: 'ilhota-perolada', nome: 'Ilhota perolada', posicao: { coluna: 3, linha: 3 }, opcional: true },
  { id: 'ponta-da-garca', nome: 'Ponta da garça', posicao: { coluna: 7, linha: 1 } },
  { id: 'ida-enseadinha', nome: 'Ir à Enseadinha', posicao: P(8, 1), destino: 'praia-enseadinha' },
];
const FIM_PRAIA = P(7, 1);
const PORTAL_CABO = P(8, 1);
const SAIDA_ENSEADINHA = P(8, 1);
const CRUZAMENTO = P(4, 3);
const PORTO = { id: 'porto', posicao: CAIS, nome: 'Voltar ao arquipélago', destino: 'arquipelago' }         ;
// O ramo novo nasce no primeiro marco sem deslocar os nós do save antigo.
const NOS_RECIFES = [
  P(2, 0), P(4, 0), P(6, 0), P(8, 0), P(8, 1), P(10, 1), P(10, 3),
  P(4, 2), P(8, 3),
]         ;
const ENTRADAS_RECIFES                     = FASES_RECIFES_AMPLIADOS.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_RECIFES[i],
  opcional: fase.id === 'recife-fio-coral' || fase.id === 'recife-mosaico',
}));
const NOS_MANGUE = [
  P(2, 0), P(4, 0), P(7, 0), P(9, 0), P(10, 1), P(10, 3), P(8, 3),
]         ;
const ENTRADAS_MANGUE                     = FASES_MANGUE_AMPLIADO.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_MANGUE[i],
}));
const ARENA_RESTINGA = P(8, 1);
const ARENA_FALESIAS = P(9, 3);
const NOS_ENSEADA = [
  P(2, 0), P(4, 0), P(6, -1), P(8, -1), P(10, -1), P(11, 1), P(11, 3),
]         ;
const ENTRADAS_ENSEADA                     = FASES_ENSEADA_AMPLIADA.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_ENSEADA[i],
}));
const ARENA_CORRENTES = P(8, 1);
const ARENA_BALSAS = P(9, 3);
const NOS_DERIVA = [
  P(2, 0), P(4, 0), P(6, -1), P(8, -1), P(10, -1), P(11, 1), P(11, 3),
]         ;
const ENTRADAS_DERIVA                     = FASES_DERIVA_AMPLIADA.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_DERIVA[i],
}));
const ARENA_SENTINELA = P(11, 1);
const ARENA_COFRE = P(11, 3);
const DESVIO_TRIO = P(8, 3);
const NOS_GRUTAS = [
  P(2, 0), P(4, -1), P(6, -1), P(8, -1), P(10, -1),
]         ;
const ENTRADAS_GRUTAS                     = FASES_GRUTAS_AMPLIADAS.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_GRUTAS[i],
}));
const NOS_RESSACA = [
  P(2, 0), P(4, -1), P(6, -1), P(8, -1), P(10, -1), P(11, 1), P(11, 3), P(8, 3),
]         ;
const ARENA_RAIZ = P(8, 1);
const ARENA_DUPLA_MANGUE = P(8, 2);
const ARENA_VIGIA = P(2, 0);
const ARENA_PONTA_DA_RESSACA = P(2, -1);
const ARENA_VENTO_SUL = P(6, 3);
const ARENA_RESSACA_ALTA = P(4, 3);
const ARENA_GUARDIAO = P(11, 4);
const ARENA_ULTIMA_VIRADA = P(8, 4);
const DESVIO_TRIO_RESSACA = P(9, 1);
const DESVIO_TRIO_FAROL = P(8, 3);
const ENTRADAS_RESSACA                     = FASES_RESSACA_AMPLIADA.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_RESSACA[i],
}));
// Os dois caminhos acrescentam desafios sem mudar os marcos persistidos na rota inicial.
const NOS_FAROL = [
  P(6, 1), P(8, 1), P(4, -1), P(6, -1), P(10, 1), P(8, -1), P(11, -1), P(11, 3),
]         ;
const ENTRADAS_FAROL                     = FASES_FAROL_AMPLIADO.map((fase, i) => ({
  id: fase.id, nome: fase.nome, posicao: NOS_FAROL[i],
}));
const ENTRADAS                                              = {
  praia: ENTRADAS_PRAIA,
  'praia-enseadinha': [
    { id: 'volta-cabo', nome: 'Voltar ao Cabo Baixo', posicao: CAIS, destino: 'praia' },
    { id: 'praia-fio-de-areia', nome: 'Fio de areia', posicao: P(2, 1) },
    { id: VIGIA_DAS_ONDAS.id, nome: VIGIA_DAS_ONDAS.nome, posicao: ARENA_VIGIA, opcional: true, chefe: true },
    { id: PONTA_DA_RESSACA.id, nome: PONTA_DA_RESSACA.nome, posicao: ARENA_PONTA_DA_RESSACA, opcional: true, chefe: true },
    { id: 'praia-pocas-espelho', nome: 'Poças em espelho', posicao: P(4, 1) },
    { id: 'praia-mirante', nome: 'Da praia ao mirante', posicao: P(6, 1) },
    { id: 'praia-bolso-mare', nome: 'Bolso da maré', posicao: P(3, 3), opcional: true },
    { id: 'praia-trilha-das-pedras', nome: 'Trilha das pedras', posicao: P(4, 0), opcional: true },
    { id: 'praia-fragmentos-areal', nome: 'Fragmentos do areal', posicao: P(7, 3), opcional: true },
    { id: 'saida-enseadinha', nome: 'Embarcar para o arquipélago', posicao: SAIDA_ENSEADINHA, destino: 'arquipelago' },
  ],
  arquipelago: [
    { id: 'rumo-praia', posicao: P(1, 3), nome: 'Praia das Conchas', destino: 'praia' },
    { id: 'rumo-recifes', posicao: P(2, 1), nome: 'Recifes Expostos', destino: 'recifes' },
    { id: 'rumo-mangue', posicao: P(5, 3), nome: 'Mangue dos Siris Duplos', destino: 'mangue' },
    { id: 'enseada', posicao: P(6, 1), nome: 'Enseada da Garça', destino: 'enseada' },
    { id: 'rumo-deriva', posicao: P(7, 3), nome: 'Ilhas à Deriva', destino: 'deriva' },
    { id: 'rumo-grutas', posicao: P(8, 1), nome: 'Grutas da Espuma', destino: 'grutas' },
    { id: 'rumo-ressaca', posicao: P(9, 3), nome: 'Baía das Brasas', destino: 'ressaca' },
    { id: 'rumo-farol', posicao: P(10, 1), nome: 'Arquipélago do Farol', destino: 'farol' },
  ],
  recifes: [
    PORTO,
    { id: 'recife-pedra-firme', posicao: P(2, 1), nome: 'Acima da espuma' },
    { id: 'recife-duas-pocas', posicao: P(4, 1), nome: 'Duas poças do recife' },
    { id: 'recife-retorno', posicao: P(6, 1), nome: 'A volta do recife' },
    ...ENTRADAS_RECIFES,
    { id: GUARDIAO_DAS_POCAS.id, posicao: P(7, 1), nome: GUARDIAO_DAS_POCAS.nome, opcional: true, chefe: true },
    { id: VIGIA_DO_RECIFE.id, posicao: P(7, 2), nome: VIGIA_DO_RECIFE.nome, opcional: true, chefe: true },
  ],
  mangue: [
    PORTO,
    { id: 'mangue-dois-encontros', posicao: P(2, 1), nome: 'Raízes vizinhas' },
    { id: 'mangue-placa', posicao: P(4, 1), nome: 'Um segura, outro passa' },
    { id: 'mangue-reuniao', posicao: P(6, 1), nome: 'Reencontro na ponta do mangue' },
    ...ENTRADAS_MANGUE,
    { id: GUARDIAO_DA_RAIZ.id, nome: GUARDIAO_DA_RAIZ.nome, posicao: ARENA_RAIZ, opcional: true, chefe: true },
    { id: DUPLA_NO_MANGUE.id, nome: DUPLA_NO_MANGUE.nome, posicao: ARENA_DUPLA_MANGUE, opcional: true, chefe: true },
  ],
  enseada: [
    PORTO,
    { id: 'enseada-sombra-restinga', posicao: P(2, 1), nome: 'Sombra na restinga' },
    { id: 'enseada-abrigo-ondas', posicao: P(4, 1), nome: 'Abrigo entre ondas' },
    { id: 'enseada-farol-baixo', posicao: P(6, 1), nome: 'Corrida ao farol baixo' },
    { id: 'enseada-dupla-vigia', posicao: P(7, 0), nome: 'Vigia em dupla', opcional: true },
    { id: 'enseada-dupla-revezamento', posicao: P(9, 0), nome: 'Revezamento na restinga', opcional: true },
    ...ENTRADAS_ENSEADA,
    { id: GARCA_DA_RESTINGA.id, nome: GARCA_DA_RESTINGA.nome, posicao: ARENA_RESTINGA, opcional: true, chefe: true },
    { id: VIGIA_DAS_FALESIAS.id, nome: VIGIA_DAS_FALESIAS.nome, posicao: ARENA_FALESIAS, opcional: true, chefe: true },
  ],
  deriva: [
    PORTO,
    { id: 'deriva-primeira-balsa', posicao: P(2, 1), nome: 'A primeira balsa' },
    { id: 'deriva-duas-margens', posicao: P(4, 1), nome: 'Duas margens' },
    { id: 'deriva-corrente-cruzada', posicao: P(6, 1), nome: 'Corrente cruzada' },
    { id: 'deriva-dupla-cais', posicao: P(7, 0), nome: 'Encontro nos dois cais', opcional: true },
    { id: 'deriva-dupla-contramao', posicao: P(9, 0), nome: 'Balsas na contramão', opcional: true },
    ...ENTRADAS_DERIVA,
    { id: MESTRE_DAS_CORRENTES.id, nome: MESTRE_DAS_CORRENTES.nome, posicao: ARENA_CORRENTES, opcional: true, chefe: true },
    { id: PASSAGEM_DAS_BALSAS.id, nome: PASSAGEM_DAS_BALSAS.nome, posicao: ARENA_BALSAS, opcional: true, chefe: true },
  ],
  grutas: [
    PORTO,
    { id: 'grutas-encaixe', posicao: P(2, 1), nome: 'Uma pérola para o portão' },
    { id: 'grutas-ordem', posicao: P(4, 1), nome: 'Duas câmaras, uma ordem' },
    { id: 'grutas-retorno', posicao: P(6, 1), nome: 'A pérola da maré baixa' },
    { id: 'grutas-dupla-portao', posicao: P(8, 1), nome: 'A pérola e a placa' },
    { id: 'grutas-dupla-camaras', posicao: P(10, 1), nome: 'Revezamento nas câmaras' },
    ...ENTRADAS_GRUTAS,
    { id: TRES_REFUGIOS.id, nome: TRES_REFUGIOS.nome, posicao: DESVIO_TRIO, opcional: true },
    { id: SENTINELA_DA_GRUTA.id, nome: SENTINELA_DA_GRUTA.nome, posicao: ARENA_SENTINELA, opcional: true, chefe: true },
    { id: COFRE_DAS_ESPUMAS.id, nome: COFRE_DAS_ESPUMAS.nome, posicao: ARENA_COFRE, opcional: true, chefe: true },
  ],
  ressaca: [
    PORTO,
    { id: 'ressaca-dupla-abrigo', posicao: P(2, 1), nome: 'Abrigo dos dois cais' },
    { id: 'ressaca-dupla-ancoradouros', posicao: P(4, 1), nome: 'Ancoradouros em revezamento' },
    ...ENTRADAS_RESSACA,
    { id: ECO_DOS_TRES_CAIS.id, nome: ECO_DOS_TRES_CAIS.nome, posicao: DESVIO_TRIO_RESSACA, opcional: true },
    { id: VENTO_SUL.id, nome: VENTO_SUL.nome, posicao: ARENA_VENTO_SUL, opcional: true, chefe: true },
    { id: RESSACA_ALTA.id, nome: RESSACA_ALTA.nome, posicao: ARENA_RESSACA_ALTA, opcional: true, chefe: true },
  ],
  farol: [
    PORTO,
    { id: 'farol-fragmento-margens', posicao: P(2, 1), nome: 'O fragmento das duas margens' },
    { id: 'farol-duas-luzes', posicao: P(4, 1), nome: 'As duas luzes do farol' },
    ...ENTRADAS_FAROL,
    { id: GUARDIAO_FAROL.id, nome: GUARDIAO_FAROL.nome, posicao: ARENA_GUARDIAO, opcional: true, chefe: true },
    { id: ULTIMA_VIRADA.id, nome: ULTIMA_VIRADA.nome, posicao: ARENA_ULTIMA_VIRADA, opcional: true, chefe: true },
    { id: TRES_LUZES_EM_REVEZAMENTO.id, nome: TRES_LUZES_EM_REVEZAMENTO.nome, posicao: DESVIO_TRIO_FAROL, opcional: true },
  ],
};

const MUNDOS = [
  { mundo: 'praia', nome: 'Praia das Conchas' },
  { mundo: 'praia-enseadinha', nome: 'Praia das Conchas · Enseadinha' },
  { mundo: 'arquipelago', nome: 'Arquipélago' },
  { mundo: 'recifes', nome: 'Recifes Expostos' },
  { mundo: 'mangue', nome: 'Mangue dos Siris Duplos' },
  { mundo: 'enseada', nome: 'Enseada da Garça' },
  { mundo: 'deriva', nome: 'Ilhas à Deriva' },
  { mundo: 'grutas', nome: 'Grutas da Espuma' },
  { mundo: 'ressaca', nome: 'Baía das Brasas' },
  { mundo: 'farol', nome: 'Arquipélago do Farol' },
]         ;

export const mundoValido = (mundo         )                 => MUNDOS.some(i => i.mundo === mundo);
export const mundoAtual = (progresso           )        => progresso.mundo ?? 'praia';
export const nomeDo = (mundo       )         => MUNDOS.find(i => i.mundo === mundo)?.nome ?? '';
export const abriuEnseada = (p           ) =>
  p.concluidas.includes('recife-retorno') && p.concluidas.includes('mangue-reuniao');

                               
              
                
               
                 
                             
                             
                 
   

function trilha(
  de         , para         , ida         , volta         , curvas                    ,
  precisa                    = [], motivo = '',
)         {
  return { de, para, ida, volta, curvas, precisa, motivo };
}

const sustentar = (
  primeira        , segunda        , terceira        , mangue = false,
)                    => [
  trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
  trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(2.75, mangue ? 1.5 : 0.625)],
    [primeira], 'Conclua a primeira travessia para seguir.'),
  trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, mangue ? 0.625 : 1.625)],
    [segunda], 'Conclua a segunda travessia para seguir.'),
  trilha(CAIS, P(6, 1), 'baixo', 'baixo', [P(0.875, 2.25), P(2, 3.375), P(4.5, 3.5), P(6.625, 2.25)],
    [terceira], 'O atalho pelo sul se abre ao concluir este mundo.'),
];

// A tecla representa a saída no nó, não a orientação de cada segmento da curva.
const TRILHAS                                             = {
  praia: [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3.125, 0.625)],
      ['primeira-onda'], 'Conclua a Primeira onda para abrir a passagem da praia.'),
    trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, 0.625)],
      ['sombra-da-garca'], 'Afaste-se da garça na travessia anterior para liberar esta passagem.'),
    trilha(P(6, 1), FIM_PRAIA, 'direita', 'esquerda', [],
      ['busca-e-volta'], 'Recupere o fragmento em Busca e volta para chegar à Ponta da garça.'),
    trilha(P(2, 1), P(3, 3), 'baixo', 'cima', [P(2.25, 2), P(2.625, 2.625)],
      ['primeira-onda'], 'A trilha opcional aparece depois da Primeira onda.'),
    trilha(P(3, 3), P(6, 1), 'baixo', 'baixo', [P(3.75, 3.75), P(5.125, 3.5), P(6, 2.375)],
      ['ilhota-perolada', 'sombra-da-garca'], 'O atalho pede a Concha Perolada e a passagem pela Sombra da garça.'),
    trilha(FIM_PRAIA, PORTAL_CABO, 'direita', 'esquerda', [],
      ['ponta-da-garca'], 'Conclua a Ponta da garça para chegar à Enseadinha.'),
  ],
  'praia-enseadinha': [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3, 1.625)],
      ['praia-fio-de-areia'], 'Conclua Fio de areia para atravessar as poças.'),
    trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, 0.625)],
      ['praia-pocas-espelho'], 'Recupere os fragmentos de Poças em espelho para ir ao mirante.'),
    trilha(P(6, 1), SAIDA_ENSEADINHA, 'direita', 'esquerda', [P(7, 0.625)],
      ['praia-mirante'], 'Complete a travessia do mirante para chegar ao embarque.'),
    trilha(P(2, 1), P(3, 3), 'baixo', 'cima', [P(2.375, 2.375)],
      ['praia-fio-de-areia'], 'Fio de areia abre o desvio da maré.'),
    trilha(P(4, 1), P(4, 0), 'cima', 'baixo', [],
      ['praia-pocas-espelho'], 'A trilha das pedras é um desvio após as poças.'),
    trilha(P(2, 1), ARENA_VIGIA, 'cima', 'baixo', [],
      ['praia-fio-de-areia'], `Conclua Fio de areia para visitar ${VIGIA_DAS_ONDAS.nome}.`),
    trilha(ARENA_VIGIA, ARENA_PONTA_DA_RESSACA, 'cima', 'baixo', [],
      [VIGIA_DAS_ONDAS.id], `Vença ${VIGIA_DAS_ONDAS.nome} para visitar ${PONTA_DA_RESSACA.nome}.`),
    trilha(P(6, 1), P(7, 3), 'baixo', 'cima', [P(6.5, 2.375)],
      ['praia-mirante'], 'O areal é um desvio após o mirante.'),
  ],
  arquipelago: [
    trilha(P(1, 3), CRUZAMENTO, 'direita', 'esquerda', [P(2, 3.375), P(3, 3.5)]),
    trilha(CRUZAMENTO, P(2, 1), 'cima', 'baixo', [P(3.875, 2.125), P(3, 1.625)]),
    trilha(CRUZAMENTO, P(5, 3), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(6, 1), 'direita', 'esquerda', [P(3.125, 0.625), P(4.75, 0.75)],
      ['recife-retorno', 'mangue-reuniao'], 'A passagem da Enseada abre ao concluir Recifes Expostos e Mangue dos Siris Duplos.'),
    trilha(P(6, 1), P(7, 3), 'direita', 'esquerda', [P(7.25, 2)],
      ['enseada-farol-baixo'], 'Conclua o trecho da Enseada da Garça para encontrar as correntes.'),
    trilha(P(7, 3), P(8, 1), 'cima', 'baixo', [P(8, 2.25)],
      ['deriva-corrente-cruzada'], 'Conclua Corrente cruzada para encontrar as Grutas da Espuma.'),
    trilha(P(8, 1), P(9, 3), 'direita', 'esquerda', [P(9, 2)],
      ['grutas-dupla-camaras'], 'Conclua Revezamento nas câmaras para abrir a Baía das Brasas.'),
    trilha(P(9, 3), P(10, 1), 'cima', 'baixo', [P(10.125, 2.25)],
      ['ressaca-dupla-ancoradouros'], 'Conclua Ancoradouros em revezamento para chegar ao Farol.'),
  ],
  recifes: [
    ...sustentar('recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'),
    trilha(P(2, 1), NOS_RECIFES[0], 'cima', 'baixo', [],
      ['recife-pedra-firme'], 'Conclua Acima da espuma para explorar o recife ao norte.'),
    trilha(NOS_RECIFES[0], NOS_RECIFES[1], 'direita', 'esquerda', [],
      ['recife-degraus'], 'Os Degraus da vazante levam às janelas do coral.'),
    trilha(NOS_RECIFES[1], NOS_RECIFES[2], 'direita', 'esquerda', [],
      ['recife-janelas'], 'Cruze as janelas do coral para alcançar a próxima pedra.'),
    trilha(NOS_RECIFES[2], NOS_RECIFES[3], 'direita', 'esquerda', [],
      ['recife-pedra-oco'], 'Pegue o fragmento no oco da pedra para abrir o costão.'),
    trilha(NOS_RECIFES[3], NOS_RECIFES[4], 'baixo', 'cima', [],
      ['recife-volta-costao', 'recife-duas-pocas'], 'Conclua Volta pelo costão e Duas poças do recife para acessar as poças suspensas.'),
    trilha(NOS_RECIFES[4], NOS_RECIFES[5], 'direita', 'esquerda', [],
      ['recife-pocas-suspensas'], 'Recupere os dois fragmentos nas poças suspensas para seguir.'),
    trilha(NOS_RECIFES[5], NOS_RECIFES[6], 'baixo', 'cima', [],
      ['recife-cintura'], 'Atravesse a cintura de espuma para chegar aos três anéis.'),
    trilha(P(4, 1), NOS_RECIFES[7], 'baixo', 'cima', [],
      ['recife-duas-pocas'], 'Duas poças do recife abre um desvio ao sul.'),
    trilha(NOS_RECIFES[6], NOS_RECIFES[8], 'esquerda', 'direita', [],
      ['recife-tres-aneis'], 'Os três anéis abrem o desvio do mosaico.'),
    trilha(P(6, 1), P(7, 1), 'direita', 'esquerda', [],
      ['recife-retorno'], 'Conclua A volta do recife para desafiar o Guardião das Poças.'),
    trilha(P(7, 1), P(7, 2), 'baixo', 'cima', [],
      [GUARDIAO_DAS_POCAS.id], 'Vença o Guardião das Poças para desafiar o Vigia do Recife.'),
  ],
  mangue: [
    ...sustentar('mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao', true),
    trilha(P(2, 1), NOS_MANGUE[0], 'cima', 'baixo', [],
      ['mangue-dois-encontros'], 'Conclua Raízes vizinhas para acessar as duas veredas.'),
    trilha(NOS_MANGUE[0], NOS_MANGUE[1], 'direita', 'esquerda', [],
      ['mangue-duas-veredas'], 'Conclua Duas veredas para encontrar os baixios.'),
    trilha(NOS_MANGUE[1], NOS_MANGUE[2], 'direita', 'esquerda', [P(4, -0.375), P(7, -0.375)],
      ['mangue-janela-partilhada'], 'Atravesse a janela da maré para chegar ao trinco.'),
    trilha(NOS_MANGUE[2], NOS_MANGUE[3], 'direita', 'esquerda', [],
      ['mangue-trinco-salgado', 'mangue-placa'], 'Conclua Trinco salgado e Um segura, outro passa para liberar o trecho.'),
    trilha(NOS_MANGUE[3], NOS_MANGUE[4], 'baixo', 'cima', [P(9, 1)],
      ['mangue-fragmentos-cruzados'], 'Busque os fragmentos nas duas margens para chegar ao cotovelo.'),
    trilha(NOS_MANGUE[4], NOS_MANGUE[5], 'baixo', 'cima', [],
      ['mangue-cotovelo'], 'Conclua Cotovelo das raízes para chegar à porteira.'),
    trilha(NOS_MANGUE[5], NOS_MANGUE[6], 'esquerda', 'direita', [],
      ['mangue-porteira-encontro'], 'Reúna a dupla depois da porteira para abrir o circuito.'),
    trilha(P(6, 1), ARENA_RAIZ, 'direita', 'esquerda', [],
      ['mangue-reuniao'], 'Conclua Reencontro na ponta do mangue para enfrentar o Guardião da Raiz.'),
    trilha(ARENA_RAIZ, ARENA_DUPLA_MANGUE, 'baixo', 'cima', [],
      [GUARDIAO_DA_RAIZ.id], 'Vença o Guardião da Raiz para abrir Dupla no Mangue.'),
  ],
  enseada: [
    ...sustentar('enseada-sombra-restinga', 'enseada-abrigo-ondas', 'enseada-farol-baixo', true),
    trilha(P(6, 1), P(7, 0), 'cima', 'baixo', [P(6.375, 0.5)],
      ['enseada-farol-baixo'], 'Conclua Corrida ao farol baixo para abrir o desvio em dupla.'),
    trilha(P(7, 0), P(9, 0), 'direita', 'esquerda', [P(8.125, 0.375)],
      ['enseada-dupla-vigia'], 'Conclua Vigia em dupla para seguir pela restinga.'),
    trilha(P(6, 1), ARENA_RESTINGA, 'direita', 'esquerda', [],
      ['enseada-farol-baixo'], 'Conclua Corrida ao farol baixo para enfrentar Garça da Restinga.'),
    trilha(ARENA_RESTINGA, ARENA_FALESIAS, 'baixo', 'cima', [P(8, 2), P(9, 2)],
      [GARCA_DA_RESTINGA.id], 'Enfrente Garça da Restinga para abrir Vigia das Falésias.'),
    trilha(P(2, 1), NOS_ENSEADA[0], 'cima', 'baixo', [],
      ['enseada-sombra-restinga'], 'Conclua Sombra na restinga para abrir o ramo norte da enseada.'),
    trilha(NOS_ENSEADA[0], NOS_ENSEADA[1], 'direita', 'esquerda', [],
      ['enseada-passo-sombra'], 'Complete Um passo antes da sombra para seguir.'),
    trilha(NOS_ENSEADA[1], NOS_ENSEADA[2], 'direita', 'esquerda', [P(5, 0), P(5, -1)],
      ['enseada-vigia-das-pedras'], 'Passe pela Vigia das pedras antes de escolher a margem.'),
    trilha(NOS_ENSEADA[2], NOS_ENSEADA[3], 'direita', 'esquerda', [],
      ['enseada-escolha-de-margem'], 'Conclua Escolha de margem para seguir.'),
    trilha(NOS_ENSEADA[3], NOS_ENSEADA[4], 'direita', 'esquerda', [],
      ['enseada-fragmento-do-bico', 'enseada-abrigo-ondas'], 'Recupere o fragmento e conclua Abrigo entre ondas para chegar à vazante.'),
    trilha(NOS_ENSEADA[4], NOS_ENSEADA[5], 'direita', 'cima', [P(11, -1)],
      ['enseada-fresta-da-vazante'], 'Atravesse a fresta para encontrar os dois pontos de coleta.'),
    trilha(NOS_ENSEADA[5], NOS_ENSEADA[6], 'baixo', 'cima', [],
      ['enseada-ecos-do-rasante'], 'Conclua Ecos do rasante para chegar à vigia da dupla.'),
  ],
  deriva: [
    ...sustentar('deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada'),
    trilha(P(6, 1), ARENA_CORRENTES, 'direita', 'esquerda', [],
      ['deriva-corrente-cruzada'], 'Conclua Corrente cruzada antes de seguir para o Mestre das Correntes.'),
    trilha(ARENA_CORRENTES, ARENA_BALSAS, 'baixo', 'cima', [P(8, 2), P(9, 2)],
      [MESTRE_DAS_CORRENTES.id], 'Vença Mestre das Correntes antes de seguir para a Passagem das Balsas.'),
    trilha(P(6, 1), P(7, 0), 'cima', 'baixo', [P(6.375, 0.5)],
      ['deriva-corrente-cruzada'], 'Conclua Corrente cruzada para abrir o desvio em dupla.'),
    trilha(P(7, 0), P(9, 0), 'direita', 'esquerda', [P(8.125, 0.375)],
      ['deriva-dupla-cais'], 'Conclua Encontro nos dois cais para alcançar a outra corrente.'),
    trilha(P(2, 1), NOS_DERIVA[0], 'cima', 'baixo', [],
      ['deriva-primeira-balsa'], 'Conclua A primeira balsa para abrir o ramo norte.'),
    trilha(NOS_DERIVA[0], NOS_DERIVA[1], 'direita', 'esquerda', [],
      ['deriva-um-passo-ao-cais'], 'Conclua Um passo ao cais para explorar o cais da alta.'),
    trilha(NOS_DERIVA[1], NOS_DERIVA[2], 'direita', 'esquerda', [P(5, 0), P(5, -1)],
      ['deriva-cais-da-alta'], 'Atravesse pelo cais da alta antes de explorar as rampas.'),
    trilha(NOS_DERIVA[2], NOS_DERIVA[3], 'direita', 'esquerda', [],
      ['deriva-duas-rampas', 'deriva-duas-margens'], 'Conclua Duas rampas e Duas margens para visitar o ilhote.'),
    trilha(NOS_DERIVA[3], NOS_DERIVA[4], 'direita', 'esquerda', [],
      ['deriva-balsas-alternadas'], 'Troque de balsa no ilhote para abrir a corrente seguinte.'),
    trilha(NOS_DERIVA[4], NOS_DERIVA[5], 'direita', 'cima', [P(11, -1)],
      ['deriva-ida-e-retorno'], 'Conclua Ida e retorno pela corrente para chegar aos ancoradouros.'),
    trilha(NOS_DERIVA[5], NOS_DERIVA[6], 'baixo', 'cima', [],
      ['deriva-dois-ancoradouros'], 'Traga os dois fragmentos para encontrar a tripulação.'),
  ],
  grutas: [
    ...sustentar('grutas-encaixe', 'grutas-ordem', 'grutas-retorno', true),
    trilha(P(6, 1), P(8, 1), 'direita', 'esquerda', [P(7, 0.625)],
      ['grutas-retorno'], 'Complete a travessia da pérola para chegar ao revezamento.'),
    trilha(P(8, 1), P(10, 1), 'direita', 'esquerda', [P(9, 1.625)],
      ['grutas-dupla-portao'], 'Conclua A pérola e a placa para chegar às outras câmaras.'),
    trilha(CAIS, P(10, 1), 'cima', 'baixo', [P(3, 0.5), P(7, 0.375), P(9, 0.5)],
      ['grutas-dupla-camaras'], 'Este caminho de volta abre depois do revezamento nas câmaras.'),
    trilha(P(2, 1), NOS_GRUTAS[0], 'cima', 'baixo', [],
      ['grutas-encaixe'], 'Conclua Uma pérola para o portão para explorar o ramo norte.'),
    trilha(NOS_GRUTAS[0], NOS_GRUTAS[1], 'direita', 'esquerda', [P(3, 0), P(3, -1)],
      ['grutas-alavanca-da-entrada'], 'Conclua A alavanca da entrada para chegar à dobra.'),
    trilha(NOS_GRUTAS[1], NOS_GRUTAS[2], 'direita', 'esquerda', [],
      ['grutas-dobra-da-camara', 'grutas-dupla-portao'], 'Conclua Dobra da câmara e A pérola e a placa para o ramo em dupla.'),
    trilha(NOS_GRUTAS[2], NOS_GRUTAS[3], 'direita', 'esquerda', [],
      ['grutas-coral-portador'], 'Leve a pérola com o siri coral para visitar a outra margem.'),
    trilha(NOS_GRUTAS[3], NOS_GRUTAS[4], 'direita', 'esquerda', [],
      ['grutas-alavanca-distante'], 'Acione A alavanca distante para abrir a boca do labirinto.'),
    trilha(P(10, 1), ARENA_SENTINELA, 'direita', 'esquerda', [],
      ['grutas-dupla-camaras'], 'Conclua Revezamento nas câmaras para encontrar a Sentinela da Gruta.'),
    trilha(ARENA_SENTINELA, ARENA_COFRE, 'baixo', 'cima', [],
      [SENTINELA_DA_GRUTA.id], 'Vença a Sentinela da Gruta para abrir o Cofre das Espumas.'),
    trilha(P(8, 1), DESVIO_TRIO, 'baixo', 'cima', [],
      ['grutas-dupla-portao'], 'Conclua A pérola e a placa para encontrar o terceiro siri.'),
  ],
  ressaca: [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3, 0.625)],
      ['ressaca-dupla-abrigo'], 'Conclua Abrigo dos dois cais para chegar aos ancoradouros.'),
    trilha(CAIS, P(4, 1), 'baixo', 'baixo', [P(2.25, 2.5), P(4.625, 2.25)],
      ['ressaca-dupla-ancoradouros'], 'O atalho abre depois do revezamento nos ancoradouros.'),
    trilha(P(2, 1), NOS_RESSACA[0], 'cima', 'baixo', [],
      ['ressaca-dupla-abrigo'], 'Conclua Abrigo dos dois cais para explorar a costa norte.'),
    trilha(NOS_RESSACA[0], NOS_RESSACA[1], 'direita', 'esquerda', [P(4, 0)],
      ['ressaca-refugio-de-pedra'], 'Conclua Refúgio da maré para chegar aos bolsos.'),
    trilha(NOS_RESSACA[1], NOS_RESSACA[2], 'direita', 'esquerda', [],
      ['ressaca-bolsos-opostos'], 'Recolha os fragmentos de Bolsos opostos para encontrar a placa.'),
    trilha(NOS_RESSACA[2], NOS_RESSACA[3], 'direita', 'esquerda', [],
      ['ressaca-vigia-da-placa'], 'Complete Vigia da placa para alcançar as balsas.'),
    trilha(NOS_RESSACA[3], NOS_RESSACA[4], 'direita', 'esquerda', [],
      ['ressaca-balsas-da-ponta', 'ressaca-dupla-ancoradouros'], 'Conclua Balsas da ponta e Ancoradouros em revezamento para chegar aos dois cais.'),
    trilha(NOS_RESSACA[4], NOS_RESSACA[5], 'direita', 'cima', [P(11, -1)],
      ['ressaca-cais-em-paralelo'], 'Cruze os Cais em paralelo para abrir o desafio das moedas.'),
    trilha(NOS_RESSACA[4], DESVIO_TRIO_RESSACA, 'baixo', 'cima', [P(9, -1)],
      ['ressaca-cais-em-paralelo'], 'Conclua Cais em paralelo para visitar o desvio do trio.'),
    trilha(NOS_RESSACA[5], NOS_RESSACA[6], 'baixo', 'cima', [],
      ['ressaca-tres-moedas-do-cais'], 'Recolha as Três moedas do cais para ir ao atracadouro.'),
    trilha(NOS_RESSACA[6], NOS_RESSACA[7], 'esquerda', 'direita', [],
      ['ressaca-atracadouro-torto'], 'Conclua Atracadouro torto para encontrar o cofre.'),
    trilha(NOS_RESSACA[7], ARENA_VENTO_SUL, 'esquerda', 'direita', [],
      ['ressaca-cofre-da-vazante'], 'Conclua Cofre da vazante para enfrentar Vento Sul.'),
    trilha(ARENA_VENTO_SUL, ARENA_RESSACA_ALTA, 'esquerda', 'direita', [],
      [VENTO_SUL.id], `Vença Vento Sul para enfrentar ${RESSACA_ALTA.nome}.`),
  ],
  farol: [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3, 0.625)],
      ['farol-fragmento-margens'], 'Recupere o fragmento para chegar às duas luzes.'),
    trilha(CAIS, P(4, 1), 'baixo', 'baixo', [P(2, 3), P(3.75, 2.5)],
      ['farol-duas-luzes'], 'O atalho abre quando as duas luzes estiverem acesas.'),
    trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [],
      ['farol-duas-luzes'], 'Acenda As duas luzes do farol para passar aos faroleiros.'),
    trilha(P(6, 1), P(8, 1), 'direita', 'esquerda', [],
      ['farol-faroleiros-de-vigia'], 'Complete Faroleiros de vigia para chegar aos guardiões.'),
    trilha(P(8, 1), P(10, 1), 'direita', 'esquerda', [],
      ['farol-turno-dos-guardioes'], 'Reúna a dupla em Turno dos guardiões para acessar o salão.'),
    trilha(P(4, 1), P(4, -1), 'cima', 'baixo', [],
      ['farol-duas-luzes'], 'Acenda As duas luzes do farol para abrir a costa.'),
    trilha(P(4, -1), P(6, -1), 'direita', 'esquerda', [],
      ['farol-costa-das-tres-luzes'], 'Recolha as moedas na Costa das três luzes para seguir.'),
    trilha(P(6, -1), P(8, -1), 'direita', 'esquerda', [],
      ['farol-faisca-de-entrada'], 'Complete Faísca de entrada para chegar aos quatro cais.'),
    trilha(P(8, -1), P(11, -1), 'direita', 'esquerda', [],
      ['farol-quatro-cais'], 'Conclua Quatro cais do farol para acessar as lentes.'),
    trilha(P(11, -1), P(10, 1), 'baixo', 'cima', [P(11, 0), P(10, 0)],
      ['farol-lentes-em-contramare', 'farol-salao-das-lanternas'],
      'Conclua Lentes em contramaré e Salão das lanternas para abrir o atalho entre as rotas.'),
    trilha(P(10, 1), P(11, 3), 'baixo', 'cima', [P(10, 2), P(11, 2)],
      ['farol-salao-das-lanternas'], 'Complete Salão das lanternas para chegar à luz final.'),
    trilha(NOS_FAROL[7], DESVIO_TRIO_FAROL, 'esquerda', 'direita', [],
      ['farol-luz-das-duas-mares'], 'Conclua A luz das duas marés para abrir o último desafio em trio.'),
    trilha(P(11, 3), ARENA_GUARDIAO, 'baixo', 'cima', [],
      ['farol-luz-das-duas-mares'], 'Conclua A luz das duas marés para visitar o Guardião do Farol.'),
    trilha(ARENA_GUARDIAO, ARENA_ULTIMA_VIRADA, 'esquerda', 'direita', [],
      [GUARDIAO_FAROL.id], 'Vença o Guardião do Farol para abrir a Última Virada.'),
  ],
};

export const trilhasDo = (mundo       ) => TRILHAS[mundo];
export const rotaLivre = (p           , t        ) => t.precisa.every(id => p.concluidas.includes(id));

export function motivoDaRota(p           , t        )         {
  const nomes = t.precisa.filter(id => !p.concluidas.includes(id)).map(id => faseDaCampanha(id).nome);
  return nomes.length ? `Conclua ${nomes.join(' e ')} para liberar este caminho.` : '';
}
export function saidaEm(progresso           , direcao         ) {
  for (const t of trilhasDo(mundoAtual(progresso))) {
    const caminho = [t.de, ...t.curvas, t.para];
    if (mesmaCasa(t.de, progresso.posicao) && t.ida === direcao) return { t, caminho, destino: t.para };
    if (mesmaCasa(t.para, progresso.posicao) && t.volta === direcao) return { t, caminho: caminho.reverse(), destino: t.de };
  }
}

export function nosDo(mundo       )                     {
  return trilhasDo(mundo).flatMap(t => [t.de, t.para]).filter((pos, i, lista) =>
    lista.findIndex(item => mesmaCasa(item, pos)) === i);
}

export function posicoesVisitaveis(mundo       , concluidas                   )                     {
  const inicio = mundo === 'arquipelago' ? P(1, 3) : CAIS;
  const disponiveis            = [inicio];
  // O mapa, a migração de saves e a seleção direta respeitam as mesmas travas.
  for (let i = 0; i < disponiveis.length; i++) {
    for (const t of trilhasDo(mundo)) {
      if (!t.precisa.every(id => concluidas.includes(id))) continue;
      const atual = disponiveis[i];
      const outro = mesmaCasa(atual, t.de) ? t.para : mesmaCasa(atual, t.para) ? t.de : undefined;
      if (outro && !disponiveis.some(n => mesmaCasa(n, outro))) disponiveis.push(outro);
    }
  }
  return disponiveis;
}

export function normalizarPosicao(
  mundo       , posicao                     , concluidas                   ,
)          {
  if (!posicao) return mundo === 'arquipelago' ? P(1, 3) : CAIS;
  const disponiveis = posicoesVisitaveis(mundo, concluidas);
  const distancia = (n         ) => Math.abs(n.coluna - posicao.coluna) + Math.abs(n.linha - posicao.linha);
  // Empates mantêm a primeira posição visitável na ordem das trilhas declaradas.
  return disponiveis.reduce((maisProxima, n) => distancia(n) < distancia(maisProxima) ? n : maisProxima);
}

export function podeSairDaPraia(p           ) {
  return mundoAtual(p) === 'praia' && mesmaCasa(p.posicao, FIM_PRAIA) && p.concluidas.includes('ponta-da-garca');
}

export function viajar(p           , destino       )            {
  const origem = mundoAtual(p);
  const entrada = entradaEm(p.posicao, origem);
  if (!(destino === 'arquipelago' && podeSairDaPraia(p)) && entrada?.destino !== destino) return p;
  const orientacao                                   = {
    praia: P(1, 3), 'praia-enseadinha': P(1, 3), recifes: P(2, 1), mangue: P(5, 3), enseada: P(6, 1), deriva: P(7, 3), grutas: P(8, 1), ressaca: P(9, 3), farol: P(10, 1), arquipelago: P(1, 3),
  };
  const posicao = destino === 'arquipelago' ? orientacao[origem] : destino === 'praia' ? (origem === 'praia-enseadinha' ? PORTAL_CABO : FIM_PRAIA) : CAIS;
  return { ...p, mundo: destino, posicao };
}

export function criarProgresso()            {
  return { posicao: CAIS, concluidas: [], viuTutorial: false };
}
export function ehIdFase(id         )               {
  return typeof id === 'string' && (IDS_DA_EXPANSAO.has(id) || FENDAS_DA_ENSEADA.some(fase => fase.id === id) || Object.values(ENTRADAS).some(entradas =>
    entradas.some(entrada => entrada.id === id && !entrada.destino)));
}
export function totalDeFasesRegulares(mundo       )         {
  return ENTRADAS[mundo].filter(entrada => !entrada.destino && !entrada.opcional).length;
}
export function faseOpcional(mundo       , id        )          {
  return (mundo === 'enseada' && FENDAS_DA_ENSEADA.some(fase => fase.id === id))
    || ENTRADAS[mundo].some(entrada => entrada.id === id && entrada.opcional);
}
export function entradaEm(posicao         , mundo        = 'praia')                      {
  return ENTRADAS[mundo].find(entrada => mesmaCasa(entrada.posicao, posicao));
}
export function moverNoMapa(progresso           , direcao         ) {
  const saida = saidaEm(progresso, direcao);
  if (!saida) return { progresso, mensagem: 'Não há trilha nessa direção.' };
  if (!rotaLivre(progresso, saida.t)) return { progresso, mensagem: motivoDaRota(progresso, saida.t) };
  const entrada = entradaEm(saida.destino, mundoAtual(progresso));
  const tipo = entrada?.chefe ? 'Chefe opcional: ' : entrada?.opcional ? 'Desvio opcional: ' : '';
  return {
    progresso: { ...progresso, posicao: saida.destino },
    caminho: saida.caminho,
    mensagem: entrada ? `${tipo}${entrada.nome}. ${entrada.destino ? 'Entre para viajar.' : 'Entre para jogar.'}` : 'Bifurcação das ilhas.',
  };
}

export const CAPITULO_FINAL = 'farol-luz-das-duas-mares';

// Os saves antigos já guardam a vitória; o desfecho não precisa de uma nova marca.
export function campanhaConcluida(progresso           )          {
  return progresso.concluidas.includes(CAPITULO_FINAL);
}

export function concluirFase(progresso           , id        )            {
  if (progresso.concluidas.includes(id)) return progresso;
  return { ...progresso, concluidas: [...progresso.concluidas, id] };
}

// Marcos físicos, incluindo as posições usadas pelos saves legados.
export const entradasDo = (mundo       )                     => ENTRADAS[mundo];
