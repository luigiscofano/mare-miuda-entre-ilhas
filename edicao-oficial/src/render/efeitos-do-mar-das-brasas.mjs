import { oscilacaoDoVapor, subirVaporSolto } from '@@MARE:modulo:src/render/animacao-visual.mjs@@';
                                                              

                                                                                            
                                                                              

// Vapor opaco em poucos degraus, em contraste com as cristas em linha d'água.
const NEVOA = ['#54616d', '#697b87', '#9cabb1']         ;
const TUFOS                                = [
  [[-1,-4,3,4,0], [0,-7,4,4,0], [2,-11,4,4,1], [3,-13,5,3,1], [7,-14,4,3,1],
    [2,-10,3,2,2], [5,-12,4,2,2], [5,-17,4,2,0], [9,-18,3,2,0]],
  [[0,-4,2,4,0], [-3,-8,4,4,0], [-5,-12,5,5,1], [-8,-14,6,4,1],
    [-6,-13,5,2,2], [-4,-10,3,2,2], [-9,-18,4,2,0]],
]         ;

export function pintarVapor(pintar             , x       , y       , variante        )       {
  for (const [dx, dy, w, h, tom] of TUFOS[variante % TUFOS.length])
    pintar(NEVOA[tom], x+dx+oscilacaoDoVapor(x,y,dy), y+dy, w, h);
}

const FONTES_ROCHA = {
  bloco: [32,28,1], seixo: [17,21,0], cunha: [14,29,1], gemeas: [31,28,0], espigao: [26,75,0],
}         ;
                                         

export function pintarVaporDoBasalto(pintar            , peca        , x       , y       )      {
  const [dx,dy,c] = FONTES_ROCHA[peca];
  pintarVapor(pintar, x+dx, y+dy, c);
}

const folga = (a       , b       , m        ) =>
  a[0]+a[2]+m<=b[0] || b[0]+b[2]+m<=a[0] || a[1]+a[3]+m<=b[1] || b[1]+b[3]+m<=a[1];

const PONTOS = [
  [.25,.22],[.78,.70],[.33,.70],[.71,.22],[.51,.31],[.56,.81],
  [.19,.42],[.79,.48],[.39,.55],[.64,.60],[.29,.94],[.67,.94],
  [.56,.13],[.30,.12],[.85,.88],[.14,.90],[.85,.14],[.13,.17],[.91,.54],[.08,.54],
]         ;

                                                                                    

export function comporEfeitosDoMar(
  largura       , altura       , reservas                 , fase       ,
)                          {
  const escolhas               =[];
  for(const [a,n,e] of [
    [0,2,'vapor'],
    [1,2,'espuma'],
  ]         ) {
    let aceitas = 0;
    const passo = (fase % 4 + a * 3) % PONTOS.length;
    const especificos = PONTOS.map((_,k)=>PONTOS[(passo+k)%PONTOS.length]);
    const perimetro = Array.from({length:11},(_,k)=>{
      const x = ((k+fase%11)%11+1)/12;
      return [[x,.06],[x,.94],[.035,x],[.965,x]]         ;
    }).flat();
    for (const [px,py] of [...especificos,...perimetro]) {
      const w = e==='vapor'?23:24;
      const h = e==='vapor'?23:8;
      const x = Math.round(largura*px-w/2), y = Math.round(altura*py-h/2);
      if (x<4 || y<4 || x+w+4>largura || y+h+4>altura) continue;
      const caixa      =[x,y,w,h];
      if (!reservas.every(r=>folga(caixa,r,6))) continue;
      if (!escolhas.every(r=>folga(caixa,r.caixa,31))) continue;
      escolhas.push({caixa,especie:e});
      if (++aceitas===n) break;
    }
  }
  return escolhas;
}

export function pintarVaporDoMar(pintar            ,efeito             , variante       )      {
  const [x,y,w,h] = efeito.caixa;
  const raizX=x+Math.floor(w/2), raizY=y+h-4;
  pintar('#294e62',raizX-6,raizY+1,12,2);
  pintar('#45697a',raizX-3,raizY,6,2);
  for (const [dx,dy,w,h,tom] of TUFOS[variante % TUFOS.length]) {
    const sobe = subirVaporSolto(raizX,raizY,dy);
    pintar(NEVOA[tom], raizX+dx+oscilacaoDoVapor(raizX,raizY,dy), raizY+dy-sobe, w, h);
  }
}
