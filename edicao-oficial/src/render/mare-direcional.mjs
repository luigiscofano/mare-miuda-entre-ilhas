// Geometria visual da maré. Não altera o estado do turno nem os tipos de terreno.
export const SEM_CHEGADA = 2147483647;
const BAIXIO = 1, OCEANO = 2;
const VIZINHOS = [[0,-1],[1,0],[0,1],[-1,0]];
const RELEVO = [0,1,2,3,3,2,1,0];

export function calcularChegadas(mapa, {
  lado = 48, ehAgua = v => v === 'O', ehBaixio = v => v === '=',
  ehAguaFora = () => false, bordaTemAgua = () => true,
} = {}) {
  const linhas=mapa.length, colunas=mapa[0]?.length??0;
  if(!Number.isInteger(lado)||lado<1||mapa.some(linha=>linha.length!==colunas))
    throw new RangeError('A máscara da maré exige um tabuleiro retangular e tiles inteiros.');
  const largura=colunas*lado, altura=linhas*lado, tamanho=largura*altura;
  const chegada=new Int32Array(tamanho).fill(SEM_CHEGADA);
  const isolada=new Uint8Array(tamanho);
  const piso=new Uint8Array(tamanho);
  const fila=new Int32Array(tamanho);
  let inicio=0, fim=0, maximo=-1;
  const terrenos=mapa.map((linha,y)=>Array.from(linha,(v,x)=>
    ehBaixio(v,x,y)?BAIXIO:ehAgua(v,x,y)?OCEANO:0));
  for(let cy=0;cy<linhas;cy++)for(let cx=0;cx<colunas;cx++){
    if(terrenos[cy][cx]!==BAIXIO)continue;
    const x=cx*lado, y=cy*lado;
    for(let px=0;px<lado;px++)piso.fill(BAIXIO,(y+px)*largura+x,(y+px)*largura+x+lado);
    // Só a orla de um vizinho marinho real inicia frente; bordas da
    // imagem, diagonais, areia seca e objetos nunca são fontes por si sós.
    for(const [dx,dy] of VIZINHOS){
      const vizinho=terrenos[cy+dy]?.[cx+dx];
      if(vizinho===undefined ? !ehAguaFora(cx+dx,cy+dy) : vizinho!==OCEANO)continue;
      for(let i=0;i<lado;i++){
        const px=x+(dy?i:dx<0?0:lado-1);
        const py=y+(dx?i:dy<0?0:lado-1);
        if(!bordaTemAgua(px,py,dx,dy))continue;
        const indice=py*largura+px;
        if(chegada[indice]===0)continue;
        chegada[indice]=0; fila[fim++]=indice;
      }
    }
  }
  // A mesma frente percorre mais de uma casa molhada, ainda sem diagonais.
  const visitar=(i,tempo)=>{
    if(piso[i]!==BAIXIO||chegada[i]!==SEM_CHEGADA)return;
    chegada[i]=tempo; fila[fim++]=i;
  };
  while(inicio<fim){
    const i=fila[inicio++], x=i%largura, tempo=chegada[i]+1;
    if(x>0)visitar(i-1,tempo);
    if(x+1<largura)visitar(i+1,tempo);
    if(i>=largura)visitar(i-largura,tempo);
    if(i+largura<tamanho)visitar(i+largura,tempo);
  }
  for(let i=0;i<tamanho;i++){
    if(piso[i]!==BAIXIO)continue;
    const cx=Math.floor(i%largura/4), cy=Math.floor(Math.floor(i/largura)/4);
    if(chegada[i]===SEM_CHEGADA){
      // Bolsão sem contato: a lâmina surge em blocos estáveis no próprio piso.
      isolada[i]=1;
      chegada[i]=18+(((cx*17+cy*31+cx)^(cy*11))%23+23)%23;
    }else if(chegada[i]>0){
      chegada[i]+=Math.max(RELEVO[cx%8],RELEVO[cy%8]);
    }
    maximo=Math.max(maximo,chegada[i]);
  }
  return {largura,altura,lado,chegada,isolada,maximo};
}

// Com a mesma máscara, baixar é voltar pelos pixels já ocupados.
export function limiarDaMare(progresso,maximo,subindo=true){
  if(maximo<0)return -1;
  const p=subindo?progresso:1-progresso;
  return p<=0?-1:p>=1?maximo+1:Math.floor(p*(maximo+1));
}

// Acabamento audiovisual da virada. A geometria usa coordenadas nativas;
// o relógio e a posição dos siris já foram decididos pelo motor.
const cacheDaMare = new Map();
export const CADENCIA_DA_MARE=24;
export const AVANCO_DA_MARE=3;
let quadroAtualDaMare;

function geometriaDaMare(mapa) {
  if(cacheDaMare.has(mapa)){
    const g=cacheDaMare.get(mapa);
    cacheDaMare.delete(mapa);cacheDaMare.set(mapa,g);
    return g;
  }
  // O quadro é uma ilha com margem de mar; o oceano exterior é explícito.
  // Paredes, terra seca, refúgios e diagonais não conduzem a inundação.
  const g=calcularChegadas(mapa,{ehAgua:v=>v==='#'||v==='~',ehAguaFora:()=>true});
  if(cacheDaMare.size===4)cacheDaMare.delete(cacheDaMare.keys().next().value);
  cacheDaMare.set(mapa,g);
  return g;
}
function degrauNoTempo(virada, agora){
  const quadro=Math.max(0,Math.floor((agora-virada.quando)/CADENCIA_DA_MARE));
  return virada.alta ? Math.min(virada.total,virada.inicio+quadro)
                    : Math.max(0,virada.inicio-quadro);
}
export function criarViradaDirecional(mapa, agora, alta, anterior, atingiu=false){
  if(!mapa.some(fila=>fila.includes('=')))return;
  const g=geometriaDaMare(mapa);
  if(g.maximo<0)return;
  // O mesmo conjunto de limiares é percorrido nos dois sentidos. Um
  // comando comum que inverte cedo a maré parte da frente já desenhada.
  const total=Math.ceil((g.maximo+1)/AVANCO_DA_MARE);
  const inicio=anterior?.g===g&&!atingiu ? degrauNoTempo(anterior,agora) : alta?0:total;
  const totalMovimento=(alta?total-inicio:inicio)*CADENCIA_DA_MARE;
  // Um último quadro cobre completamente o Siri antes de recuperar.
  const duracao=totalMovimento+(atingiu?CADENCIA_DA_MARE:0);
  if(!duracao)return;
  return {quando:agora,alta,g,inicio,total,duracao,afetados:[]};
}
export function quadroDaViradaDirecional(virada,agora){
  if(!virada)return;
  const t=agora-virada.quando;
  if(t<0||t>=virada.duracao)return;
  const degrau=degrauNoTempo(virada,agora);
  const limiar=degrau===virada.total ? virada.g.maximo : degrau*AVANCO_DA_MARE-1;
  const proximo=(Math.floor(t/CADENCIA_DA_MARE)+1)*CADENCIA_DA_MARE;
  return {g:virada.g,limiar,
    ate:Math.min(virada.duracao,proximo)-t,afetados:virada.afetados};
}
export function comViradaDirecional(quadro,desenhar) {
  const anterior=quadroAtualDaMare;
  quadroAtualDaMare=quadro;
  try{return desenhar();}finally{quadroAtualDaMare=anterior;}
}

function reterFaixas(pintar, x, y, tx, ty, molhada) {
  const {g,limiar}=quadroAtualDaMare;
  return (cor,u,v,l,a)=>{
    const inicioX=Math.max(x,u),fimX=Math.min(x+g.lado,u+l);
    const inicioY=Math.max(y,v),fimY=Math.min(y+g.lado,v+a);
    for(let py=inicioY;py<fimY;py++){
      const linha=(ty+py-y)*g.largura+tx-x;
      let esquerda=inicioX;
      while(esquerda<fimX){
        const cabe=(g.chegada[linha+esquerda]<=limiar)===molhada;
        let direita=esquerda+1;
        while(direita<fimX&&((g.chegada[linha+direita]<=limiar)===molhada)===cabe)direita++;
        if(cabe)pintar(cor,esquerda,py,direita-esquerda,1);
        esquerda=direita;
      }
    }
  };
}
export function pintarBaixioNaVirada(pintar,x,y,coluna,linha,terra,agua,paleta){
  if(!quadroAtualDaMare)return false;
  const {g,limiar}=quadroAtualDaMare;
  const tx=coluna*g.lado, ty=linha*g.lado;
  if(tx<0||ty<0||tx>=g.largura||ty>=g.altura)return false;
  const side=g.lado;
  let menor=Infinity,maior=-1;
  for(let v=ty;v<ty+side;v++)for(let u=tx;u<tx+side;u++){
    const d=g.chegada[v*g.largura+u];
    menor=Math.min(menor,d);maior=Math.max(maior,d);
  }
  if(menor>limiar){terra(pintar);return true;}
  if(maior<limiar-2||limiar>=g.maximo){agua(pintar);return true;}
  terra(reterFaixas(pintar,x,y,tx,ty,false));
  agua(reterFaixas(pintar,x,y,tx,ty,true));
  // 2 pixels atrás da própria frente, sem espalhar para outras casas.
  for(let v=0;v<side;v++)for(let u=0;u<side;u++){
    const i=(ty+v)*g.largura+tx+u,d=g.chegada[i];
    if(d>limiar||d<limiar-2||g.isolada[i])continue;
    const tinta=(Math.floor((tx+u)/3)+Math.floor((ty+v)/3))%5<=1
      ? paleta.espuma[0] : paleta.aguaRasa[1];
    pintar(tinta,x+u,y+v,1,1);
  }
  return true;
}
export function siriCobertoPelaMare(indice) {
  return Boolean(quadroAtualDaMare?.afetados[indice]);
}
export function desenharSiriSobAMare(ctx,img,sx,sy,w,h,x,y,indice){
  const quadro=quadroAtualDaMare;
  const afetado=quadro?.afetados[indice];
  if(!afetado)return false;
  const {g,limiar}=quadro;
  const {coluna,linha,retorno}=afetado;
  const destinoX=x+(coluna-retorno.coluna)*g.lado;
  const destinoY=y+(linha-retorno.linha)*g.lado;
  // Origem exata do desenho oficial do siri dentro do tile, 8 × 12.
  const tx=coluna*g.lado+8, ty=linha*g.lado+12;
  for(let v=0;v<h;v++){
    const linha=(ty+v)*g.largura+tx;
    let inicio=0;
    while(inicio<w){
      const seco=g.chegada[linha+inicio]>limiar;
      let fim=inicio+1;
      while(fim<w&&(g.chegada[linha+fim]>limiar)===seco)fim++;
      if(seco)ctx.drawImage(img,sx+inicio,sy+v,fim-inicio,1,destinoX+inicio,destinoY+v,fim-inicio,1);
      inicio=fim;
    }
  }
  return true;
}
