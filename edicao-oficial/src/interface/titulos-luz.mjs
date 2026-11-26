import { LETREIROS } from '@@MARE:modulo:src/interface/letreiros-luz.mjs@@';

import { emIngles } from '@@MARE:modulo:src/idiomas/idioma.mjs@@';
import { LETREIROS_EN } from '@@MARE:modulo:src/idiomas/letreiros-en.mjs@@';

const uriDoLetreiro = (valor) => valor.startsWith('./assets/letreiros/')
  ? valor : 'data:image/png;base64,' + valor;
export function atualizarTituloIluminado(heading,nome,iluminado) {
 const texto=heading.querySelector('.titulo-luz-texto');
 const desenho=heading.querySelector('.titulo-luz');
 const figura=desenho.querySelector('img');
 const reduzido=desenho.querySelector('source');
 texto.textContent=nome;
 // A voz e o texto continuam íntegros mesmo se uma fase assentada depois
 // do catálogo não tiver uma arte rasterizada ainda.
 const catalogo=emIngles()?LETREIROS_EN:LETREIROS;
 const camadas=iluminado && Object.hasOwn(catalogo,nome) ? catalogo[nome] : undefined;
 desenho.hidden=!camadas;
 if(!camadas){heading.removeAttribute('data-titulo-luz');return;}
 figura.setAttribute('src', uriDoLetreiro(camadas[0]));
 reduzido.setAttribute('srcset', uriDoLetreiro(camadas[1]));
 heading.setAttribute('data-titulo-luz','');
}
