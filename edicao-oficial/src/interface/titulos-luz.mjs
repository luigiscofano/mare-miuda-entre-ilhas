import { LETREIROS } from '@@MARE:modulo:src/interface/letreiros-luz.mjs@@';

const URI_DA_ARTE = 'data:image/png;base64,';
export function atualizarTituloIluminado(heading,nome,iluminado) {
 const texto=heading.querySelector('.titulo-luz-texto');
 const desenho=heading.querySelector('.titulo-luz');
 const figura=desenho.querySelector('img');
 const reduzido=desenho.querySelector('source');
 texto.textContent=nome;
 // A voz e o texto continuam íntegros mesmo se uma fase assentada depois
 // do catálogo não tiver uma arte rasterizada ainda.
 const camadas=iluminado && Object.hasOwn(LETREIROS,nome) ? LETREIROS[nome] : undefined;
 desenho.hidden=!camadas;
 if(!camadas){heading.removeAttribute('data-titulo-luz');return;}
 figura.setAttribute('src', URI_DA_ARTE+camadas[0]);
 reduzido.setAttribute('srcset', URI_DA_ARTE+camadas[1]);
 heading.setAttribute('data-titulo-luz','');
}
