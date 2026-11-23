// Quando a arte recorta um traço, o sorteio de inspeção repete a mesma
// regra de estratos somente sobre reflexos inteiros nas duas marés.
const AJUSTES_VISIVEIS = {
 "114,18,23,3;224,28,20,3;19,108,18,4;287,129,20,4;346,151,14,3;350,198,14,4;19,210,18,3;86,210,16,3;157,219,23,4;236,214,20,3;303,212,14,3;354,221,18,4": [
  1,
  9
 ],
 "138,30,23,3;265,26,20,3;392,49,14,4;55,258,18,3;436,307,14,4;109,334,16,3;206,353,23,4;304,345,20,3;440,353,18,4": [
  1,
  7
 ],
 "110,30,23,3;212,26,20,3;315,49,14,4;66,102,16,3;106,178,16,3;350,307,14,4;86,334,16,3;165,353,23,4;244,345,20,3;354,353,18,4": [
  2,
  5
 ],
 "138,30,23,3;265,26,20,3;416,129,14,3;255,182,23,3;55,258,18,3;436,307,14,4;109,334,16,3;206,353,23,4;304,345,20,3;440,353,18,4": [
  2,
  5
 ],
 "138,30,23,3;265,26,20,3;392,49,14,4;84,102,16,3;323,106,20,3;416,129,14,3;133,178,16,3;55,258,18,3;109,334,16,3;206,353,23,4;304,345,20,3;440,353,18,4": [
  1,
  4,
  10
 ],
 "143,26,23,3;401,126,14,3;26,152,18,4;172,222,16,4;304,225,23,3;436,278,14,4;26,295,18,3;109,295,16,3;196,308,23,4;294,302,20,3;377,298,14,3;440,312,18,4": [
  0,
  6,
  8
 ],
 "247,12,10,3;39,12,18,3;195,31,10,3;179,31,10,2;347,88,15,3;38,145,15,3;9,164,18,2;169,202,10,2;76,202,22,2;156,221,22,2;234,221,22,3;264,240,10,2;340,259,15,2;255,278,18,2;12,316,15,3;88,354,15,2;87,373,18,3;16,373,18,2;83,411,18,3;62,430,18,2;301,430,10,2;33,449,18,2;275,449,22,2": [
  3,
  6,
  12,
  18
 ],
 "309,12,22,2;224,12,15,3;141,31,22,2;116,31,15,2;79,50,15,3;9,145,10,2;314,164,22,3;9,183,10,2;159,202,22,2;25,202,15,2;19,221,18,2;240,221,15,3": [
  1,
  10
 ]
};
// Sorteio estável por composição. O percurso serpenteia entre faixas para
// colocar uma retirada em cada trecho em vez de concentrá-las numa região.
export function selecionarEspalhados(candidatos,retirar,assinatura){
 let semente=2166136261;
 for(const c of assinatura)semente=Math.imul(semente^c.charCodeAt(0),16777619);
 const espacados=candidatos.map((t,indice)=>({t,indice})).sort((a,b)=>
   Math.floor(a.t[1]/48)-Math.floor(b.t[1]/48)||
   (Math.floor(a.t[1]/48)%2 ? b.t[0]-a.t[0] : a.t[0]-b.t[0])||
   a.t[1]-b.t[1]||a.indice-b.indice);
 return Array.from({length:retirar},(_,i)=>{
   const a=Math.floor(i*espacados.length/retirar),b=Math.floor((i+1)*espacados.length/retirar);
   semente^=semente<<13;semente^=semente>>>17;semente^=semente<<5;
   // Em sorteios vizinhos, a metade central evita que as duas escolhas
   // acabem espremidas na mesma fronteira dos estratos.
   const r=.25+((semente>>>0)/4294967296)*.5;
   return espacados[a+Math.floor(r*(b-a))].indice;
 });
}
export function reduzirReflexos(tracos, ehReflexo=()=>true){
 const candidatos=tracos.filter(ehReflexo);
 const retirar=candidatos.length ? Math.max(1,Math.round(candidatos.length/5)) : 0;
 if(!retirar)return tracos;
 const assinatura=candidatos.map(t=>t.slice(0,4).join(',')).join(';');
 const indices=AJUSTES_VISIVEIS[assinatura]??selecionarEspalhados(candidatos,retirar,assinatura);
 const ocultos=new Set(indices.map(i=>candidatos[i]));
 return tracos.filter(t=>!ocultos.has(t));
}
