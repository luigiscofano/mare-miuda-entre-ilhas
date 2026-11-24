import { TEXTO_EN } from '@@MARE:modulo:src/idiomas/textos-en.mjs@@';
import { FASES_EN } from '@@MARE:modulo:src/idiomas/fases-en.mjs@@';

let idioma = 'pt-BR';
export const emIngles = () => idioma === 'en';
export const faseEmIngles = id => FASES_EN[id];

const traducao = new Map(Object.entries(TEXTO_EN));
const normalizar = s => s.trim().replace(/\s+/g, ' ');
let frases;
const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function registrarTextosDaCampanha(fases, formatar) {
  for (const fase of fases) {
    const en = faseEmIngles(fase.id);
    if (!en) continue;
    for (const k of ['nome','objetivo','ensino']) {
      if (!fase[k] || !en[k]) continue;
      traducao.set(normalizar(fase[k]),en[k]);
      if (k !== 'nome') traducao.set(normalizar(formatar(fase,fase[k])),en[k]);
    }
  }
  frases = undefined;
}
const salvo = {
 'ocupada':'occupied','bloqueada':'blocked','disputada':'contested',
 'ocupada por outro siri':'occupied by another crab',
 'disputada por mais de um siri':'contested by multiple crabs',
};
const passos = n => n+' '+(n==='1'?'step':'steps');
const dinamicos = [
 [/\bEm (\d+) passos? a maré (sobe|desce)\./g,(_,n,frequencia) => 'The tide '+(frequencia==='sobe'?'rises':'falls')+' in '+passos(n)+'.'],
 [/\bRasante no próximo passo:/g,'Heron swoop next step:'],
 [/\bGarça no próximo passo:/g,'Heron next step:'],
 [/\bcoluna (\d+), linha (\d+)/g,'column $1, row $2'],
 [/\bChegada: um siri em cada uma das (\d+) conchas\./g,'Goal: one crab on each of the $1 shells.'],
 [/\bFenda (redonda|estreita):/g,(_,m) => (TEXTO_EN[m][0].toUpperCase()+TEXTO_EN[m].slice(1))+' rock cleft:'],
 [/\bFechada: ([^.]+) sob a água\./g,'Closed: $1 is underwater.'],
 [/\b(vai para|fica no lugar)\b/g,(_,v) => v==='vai para'?'moves to':'stays put'],
 [/\b(Saída|saída) da fenda (ocupada por outro siri|disputada por mais de um siri|ocupada|disputada|bloqueada)\b/g,(_,s,m) => (s==='Saída'?'R':'r')+'ock cleft exit '+salvo[m]],
 [/\bficou no lugar:/g,'stayed put:'],
 [/\batravessou a fenda (redonda|estreita)/g,(_,m) => 'crossed the '+TEXTO_EN[m]+' rock cleft'],
 [/\bentrada em (column \d+, row \d+), saída em /g,'entrance at $1, exit at '],
 [/\bPérolas: (\d+)\/(\d+)/g,'Pearls: $1/$2'],
 [/\bConcha (\d+):/g,'Shell $1:'],
 [/\bSiri na (column \d+, row \d+)/g,'Crab at $1'],
 [/\bMundo (\d+) \/ (\d+) fases/g,'World $1 / $2 levels'],
 [/\bMundo (\d+)\./g,'World $1.'],
 [/\b(\d+) fases\b/g,'$1 levels'],
 [/\bFase (\d+)\./g,'Level $1.'],
 [/\bPágina (\d+) (\/|de) (\d+)/g,(_,a,separador,b)=>'Page '+a+(separador==='/'?' / ':' of ')+b],
 [/\bTravessias concluídas:/g,'Crossings completed:'],
 [/\bArena vencida:/g,'Arena cleared:'],
 [/\bPróximo nível:/g,'Next level:'],
 [/\bTrecho:/g,'Route:'],
 [/\bConclua ([^.]+) para liberar (esta travessia|este desvio|este caminho)\./g, (_,fase,rota)=>'Complete '+fase+' to unlock this '+({'esta travessia':'crossing','este desvio':'detour','este caminho':'route'})[rota]+'.'],
];
export function traduzir(texto) {
  if (!emIngles() || !texto) return texto;
  const entrada=normalizar(texto);
  const exata=traducao.get(entrada);
  if (exata!==undefined) return texto.replace(/^(\s*)[\s\S]*?(\s*)$/, (_,antes,depois)=>antes+exata+depois);
  let pronta=texto;
  for (const [busca, troca] of dinamicos) pronta=pronta.replace(busca,troca);
  // Atualizações podem combinar frases, nomes de fase e estados no mesmo anúncio.
  if (!frases) {
    const alvos=[...traducao.keys()].filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
    // Evita traduzir pedaços de identificadores, símbolos do tabuleiro e nomes próprios.
    frases=new RegExp('(?<![\\p{L}\\p{N}_-])(?:'+alvos.map(escapar).join('|')+')(?![\\p{L}\\p{N}_-])','gu');
  }
  return pronta.replace(frases,v=>traducao.get(v))
    .replace(/(Complete )([^.]+?)( to unlock this )/g,(_,a,nomes,c)=>a+nomes.replaceAll(' e ',' and ')+c);
}

export function ligarIdioma(doc, redesenhar = () => {}, preferido = 'pt-BR') {
  const botoes=doc.querySelectorAll('[data-idioma-jogo]');
  if (!botoes.length || typeof globalThis.MutationObserver!=='function') return;
  const textos=new WeakMap(), atributos=new WeakMap();
  const chaves=['aria-label','alt','title','data-rotulo-contraste'];
  const manter = el => el?.closest?.('script,style,[data-manter-idioma],[data-idioma-jogo]');
  function atualizar(valor, anterior, escrever) {
    const origem=anterior?.aplicado===valor?anterior.origem:valor;
    const aplicado=traduzir(origem);
    if (aplicado!==valor) escrever(aplicado);
    return {origem,aplicado};
  }
  function texto(no) {
    if (manter(no.parentElement) || no.parentElement?.closest?.('pre')) return;
    textos.set(no,atualizar(no.nodeValue,textos.get(no),v=>{no.nodeValue=v;}));
  }
  function atributo(el, chave) {
    if (manter(el)) return;
    const original=el.getAttribute(chave);
    const mapa=atributos.get(el)??new Map();
    if (original===null) {mapa.delete(chave);return;}
    mapa.set(chave,atualizar(original,mapa.get(chave),v=>el.setAttribute(chave,v)));
    atributos.set(el,mapa);
  }
  function arvore(no) {
    if (no.nodeType===3) {texto(no);return;}
    if (no.nodeType!==1 && no.nodeType!==9 || manter(no)) return;
    if (no.nodeType===1) for (const chave of chaves) atributo(no,chave);
    for (const filho of no.childNodes) arvore(filho);
  }
  function aplicar(novo) {
    idioma=novo==='en'?'en':'pt-BR';
    doc.documentElement.setAttribute('lang',idioma);
    for (const botao of botoes) {
      botao.setAttribute('aria-label',emIngles()?'Switch to Portuguese':'Mudar para inglês');
      botao.textContent=emIngles()?'PT':'EN';
      botao.setAttribute('lang',idioma);
    }
    arvore(doc.documentElement);
    redesenhar();
  }
  for (const botao of botoes) botao.addEventListener('click',()=>aplicar(emIngles()?'pt-BR':'en'));
  const observador=new MutationObserver(registros=>{
    for (const r of registros) {
      if (r.type==='attributes') atributo(r.target,r.attributeName);
      else if (r.type==='characterData') texto(r.target);
      else for (const no of r.addedNodes) arvore(no);
    }
  });
  observador.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:chaves});
  aplicar(preferido);
}
