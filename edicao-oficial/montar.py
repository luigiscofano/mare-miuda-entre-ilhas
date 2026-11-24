"""Gera um HTML offline a partir dos módulos e recursos desta edição."""
from base64 import b64encode
from functools import lru_cache
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile
import argparse,json,re

MARCADOR=re.compile(rb'@@MARE:(texto|b64|modulo):([a-z0-9_./-]+)@@')
def montar(raiz):
    midia = {}
    # As bases tipográficas não substituem nenhuma arte do jogo original.
    for pacote in ("assets.zip", "assets-tipografia.zip"):
        with ZipFile(raiz / pacote) as z:
            for nome in z.namelist():
                if nome in midia:
                    raise ValueError(f"Recurso repetido nos pacotes: {nome}")
                midia[nome] = z.read(nome)
    @lru_cache(None)
    def dados(arquivo):
        if arquivo.startswith("assets/"):
            return midia[arquivo]
        local=(raiz/arquivo).resolve()
        if not local.is_relative_to(raiz.resolve()):
            raise ValueError('O recurso deve estar dentro da edição.')
        return local.read_bytes()
    @lru_cache(None)
    def resolver(modo,arquivo):
        conteudo=dados(arquivo)
        if modo==b'b64':return b64encode(conteudo)
        conteudo=montar_texto(conteudo)
        if modo==b'modulo':return b'data:text/javascript;base64,'+b64encode(conteudo)
        return conteudo
    def montar_texto(origem):
        return MARCADOR.sub(lambda m:resolver(m[1],m[2].decode()),origem)
    return montar_texto(dados('index.html'))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destino',type=Path)
    parser.add_argument('--verificar',action='store_true',help='Exige os mesmos bytes da entrega aprovada.')
    a=parser.parse_args()
    raiz=Path(__file__).resolve().parent
    html=montar(raiz)
    hash_atual=sha256(html).hexdigest()
    if a.verificar:
        esperado=json.loads((raiz/'verificacao.json').read_text())
        if hash_atual!=esperado['sha256'] or len(html)!=esperado['tamanho']:
            raise SystemExit('O HTML diverge da entrega de referência.')
    a.destino.parent.mkdir(parents=True,exist_ok=True)
    a.destino.write_bytes(html)
    print(hash_atual)
