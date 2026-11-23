// Os cartões usam o mesmo grafo, posição de chegada e viagem da campanha.
const MUNDOS = [{"id": "praia", "fases": 31}, {"id": "recifes", "fases": 29}, {"id": "mangue", "fases": 27}, {"id": "enseada", "fases": 31}, {"id": "deriva", "fases": 29}, {"id": "grutas", "fases": 28}, {"id": "ressaca", "fases": 28}, {"id": "farol", "fases": 28}];
const mesmaCasa = (a,b) => a.coluna===b.coluna && a.linha===b.linha;
export function regioesDoHub(progresso, {entradasDo,posicoesVisitaveis,trilhasDo,motivoDaRota}) {
  const visitaveis = posicoesVisitaveis('arquipelago', progresso.concluidas);
  const entradas = entradasDo('arquipelago');
  const trilhas = trilhasDo('arquipelago');
  return MUNDOS.map(mundo=>{
    const entrada = entradas.find(e=>e.destino===mundo.id);
    const livre = visitaveis.some(p=>mesmaCasa(p,entrada.posicao));
    const ligacao = !livre && trilhas.find(t=>mesmaCasa(t.de,entrada.posicao) || mesmaCasa(t.para,entrada.posicao));
    return {...mundo, nome:entrada.nome, posicao:entrada.posicao, livre,
      motivo: livre ? '' : (ligacao && motivoDaRota(progresso,ligacao)) || 'Conclua as travessias anteriores para liberar esta região.'};
  });
}
export function jogarRegiao(progresso,id,regras) {
  const regiao = regioesDoHub(progresso,regras).find(e=>e.id===id);
  if (!regiao?.livre) return progresso;
  return regras.viajar({...progresso,posicao:regiao.posicao},id);
}
export function regiaoDoMarco(progresso,regras) {
  return regioesDoHub(progresso,regras).find(o=>o.livre && mesmaCasa(o.posicao,progresso.posicao))?.id;
}
const criar=(doc,tipo,classe,texto)=>{
  const el=doc.createElement(tipo); if(classe)el.className=classe;
  if(texto)el.textContent=texto;
  return el;
};
const botao=(doc,classe,rotulo)=>{
  const b=criar(doc,'button','hub-botao '+classe);
  b.type='button';
  b.setAttribute('aria-label',rotulo);
  return b;
};
const bloqueioDeClique = new WeakMap();
export function renderizarHub(doc,painel,{regioes,primeiro,movel,jogar,voltar,paginar}) {
  const porPagina=movel?1:2;
  const total=Math.ceil(regioes.length/porPagina);
  const indice=Math.floor(primeiro/porPagina);
  const palco=criar(doc,'div','hub-palco');
  palco.setAttribute('data-pagina-hub-visual',String(indice+1));
  const heading=criar(doc,'h2','hub-leitor','Arquipélago. Escolha uma região.');
  heading.setAttribute('id','titulo-cartoes-arquipelago');
  heading.setAttribute('tabindex','-1');
  const inicio=botao(doc,'hub-inicio','Início');
  inicio.setAttribute('data-rotulo-contraste','Início');
  inicio.setAttribute('id','inicio-arquipelago');
  inicio.addEventListener('click',voltar);
  palco.append(heading,inicio);
  for (const [slot,p] of regioes.slice(indice*porPagina,(indice+1)*porPagina).entries()){
    const card=criar(doc,'article','hub-cartao');
    card.setAttribute('data-slot',String(slot));
    card.setAttribute('data-arte-regiao',p.id);
    const h=criar(doc,'h3','hub-leitor',p.nome);
    const status=p.livre?'Jogar':'Bloqueado';
    const cta=botao(doc,'hub-regiao',`${p.nome}. ${p.fases} fases. ${status}.${p.motivo?' '+p.motivo:''}`);
    cta.setAttribute('data-regiao',p.id);
    cta.setAttribute('data-rotulo-contraste',status);
    if (!p.livre) {
      cta.setAttribute('aria-disabled','true');
      if (p.motivo)cta.setAttribute('title',p.motivo);
    } else cta.addEventListener('click',()=>jogar(p.id));
    card.append(h,cta);palco.append(card);
  }
  const pag=criar(doc,'div','hub-paginacao');
  const apontador=criar(doc,'p','hub-leitor hub-indicador',`Página ${indice+1} de ${total}`);
  apontador.setAttribute('tabindex','-1');
  for(const [id,delta,rotulo,ativo] of [['anterior',-1,'Página anterior',indice>0],['proxima',1,'Próxima página',indice<total-1]]) {
    const b=botao(doc,'hub-seta',rotulo);
    b.setAttribute('data-pagina-hub',id);
    b.setAttribute('data-rotulo-contraste',delta<0?'←':'→');
    b.disabled=!ativo;
    b.addEventListener('click',()=>paginar(delta,true));
    if(delta===1)pag.append(apontador);
    pag.append(b);
  }
  palco.append(pag);
  if(movel) {
    if (!bloqueioDeClique.has(painel)) {
      bloqueioDeClique.set(painel,-Infinity);
      // O painel é estável entre páginas: captura também um clique no cartão recém-renderizado.
      painel.addEventListener('click',e=>{
        if(e.detail && Date.now()-bloqueioDeClique.get(painel)<350){
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);
    }
    let toque;
    palco.addEventListener('pointerdown',e=>{
      bloqueioDeClique.set(painel,-Infinity);
      if(e.pointerType==='touch'&&e.isPrimary!==false)toque={x:e.clientX,y:e.clientY,id:e.pointerId};
    });
    palco.addEventListener('pointercancel',()=>{toque=undefined;});
    palco.addEventListener('pointerup',e=>{
      if(!toque||e.pointerId!==toque.id)return;
      const dx=e.clientX-toque.x,dy=e.clientY-toque.y;
      toque=undefined;
      if(Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.35){
        bloqueioDeClique.set(painel,Date.now());
        paginar(dx<0?1:-1,false);
      }
    });
  }
  palco.addEventListener('keydown',e=>{
    if (e.altKey||e.ctrlKey||e.metaKey||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();
    paginar(e.key==='ArrowLeft'?-1:1,true);
  });
  painel.replaceChildren(palco);
}
