"""Monta a edição Web ou offline com um único exemplar de cada módulo."""
from argparse import ArgumentParser
from base64 import b64decode, b64encode
from functools import cache
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile
import json
import re

MARCADOR = re.compile(rb'@@MARE:(texto|b64|modulo):([a-z0-9_./-]+)@@')

p = ArgumentParser(description=__doc__)
p.add_argument('destino', type=Path)
p.add_argument('--web', action='store_true')
p.add_argument('--verificar', action='store_true', help='Confere os bytes da edição offline.')
args = p.parse_args()
if args.web and args.verificar:
    p.error("Use --verificar para a edição offline, sem --web.")
raiz = Path(__file__).resolve().parent
midia = {}
for pacote in ('assets.zip', 'assets-tipografia.zip'):
    with ZipFile(raiz / pacote) as zip:
        for nome in zip.namelist():
            if nome in midia:
                raise ValueError(f'Recurso repetido nos pacotes: {nome}')
            midia[nome] = zip.read(nome)
mapa = {}

@cache
def dados(nome):
    if nome.startswith('assets/'):
        return midia[nome]
    arquivo = (raiz / nome).resolve()
    if not arquivo.is_relative_to(raiz):
        raise ValueError('O recurso deve estar dentro da edição.')
    return arquivo.read_bytes()

@cache
def externo(nome):
    arquivo = args.destino.parent / nome
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    arquivo.write_bytes(dados(nome))
    return ('./' + nome).encode()

def separar_letreiros(conteudo):
    # A abertura não decodifica todos os títulos. O navegador busca apenas
    # a imagem da fase visível, preservando o PNG original byte por byte.
    cabecalho, catalogo = conteudo.decode().split(' = ', 1)
    catalogo = json.loads(catalogo.strip().removesuffix(';'))
    for nome, camadas in catalogo.items():
        for i, imagem in enumerate(camadas):
            png = b64decode(imagem)
            nome_do_arquivo = f'assets/letreiros/{sha256(png).hexdigest()[:24]}.png'
            destino = args.destino.parent / nome_do_arquivo
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(png)
            camadas[i] = './' + nome_do_arquivo
    return (cabecalho + ' = ' + json.dumps(catalogo, ensure_ascii=False) + ';\n').encode()


@cache
def resolver(modo, nome):
    if modo == b'b64':
        return b64encode(dados(nome))
    if modo == b'texto':
        return montar(dados(nome))
    # As importações usam o mesmo identificador em toda a árvore: nenhum
    # módulo acaba embutido de novo dentro de quem o importa.
    alias = 'mare/' + nome
    if args.web:
        caminho = args.destino.parent / nome
        caminho.parent.mkdir(parents=True, exist_ok=True)
        conteudo = dados(nome)
        if nome in ('src/interface/letreiros-luz.mjs', 'src/idiomas/letreiros-en.mjs'):
            conteudo = separar_letreiros(conteudo)
        caminho.write_bytes(montar(conteudo))
        mapa[alias] = './' + nome
    else:
        mapa[alias] = 'data:text/javascript;base64,' + b64encode(montar(dados(nome))).decode()
    return alias.encode()

def montar(origem):
    if args.web:
        origem = re.sub(rb'data:(?:image/png|font/woff);base64,@@MARE:b64:([a-z0-9_./-]+)@@',
                        lambda m: externo(m[1].decode()), origem)
        origem = re.sub(rb'(<script type="application/octet-stream" id="[^"]+")>@@MARE:b64:([a-z0-9_./-]+)@@</script>',
                        lambda m: m[1] + b' data-src="' + externo(m[2].decode()) + b'"></script>', origem)
    return MARCADOR.sub(lambda m: resolver(m[1], m[2].decode()), origem)

html = montar(dados('index.html'))
# O src de uma tag script não resolve aliases; import() resolve e permite
# apresentar um aviso local se os módulos não puderem ser lidos.
local = b'<script type="module" src="mare/src/app.mjs"></script>'
inicializador = b'<script type="module">import("mare/src/app.mjs").catch(() => { document.getElementById("carregando-jogo").textContent = "N\xc3\xa3o foi poss\xc3\xadvel carregar a edi\xc3\xa7\xc3\xa3o."; });</script>'
html = html.replace(local, b'<script type="importmap">' + json.dumps({'imports': mapa}).encode()
                    + b'</script>' + inicializador)
assert b'@@MARE:' not in html and local not in html
if args.verificar:
    registro = json.loads((raiz / 'verificacao.json').read_text())
    if registro != {'sha256': sha256(html).hexdigest(), 'tamanho': len(html)}:
        raise SystemExit('O HTML diverge da edição de referência.')
args.destino.parent.mkdir(parents=True, exist_ok=True)
args.destino.write_bytes(html)
print(f'{args.destino.name}: {len(html):,} bytes; {len(mapa)} módulos únicos')
