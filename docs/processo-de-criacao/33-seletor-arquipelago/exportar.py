"""Recompõe os terrenos do estudo Meia-Lua; nunca importa a sua antiga navegação."""
import argparse
import hashlib
from pathlib import Path

from PIL import Image, ImageDraw

DIM = (512, 384)
HEX_MAR = '#055e6b'
MAR = {(5, 94, 107), (2, 114, 131), (4, 68, 94)}
# Os aportes no estudo são separados, para consumo sem seus antigos cais.
CORTE_NEVE = [(179, 0), (287, 0), (287, 69), (269, 68), (246, 70),
              (225, 73), (214, 73), (199, 72), (179, 64)]


def camada(caminho, sha_esperado):
    dados = caminho.read_bytes()
    sha = hashlib.sha1(f'blob {len(dados)}\0'.encode() + dados).hexdigest()
    if sha != sha_esperado:
        raise ValueError(f'Camada inesperada: {caminho.name} ({sha})')
    im = Image.open(caminho).convert('RGBA')
    assert im.size == (288, 216) and set(im.getchannel('A').get_flattened_data()) <= {0, 255}
    return im


def terreno(im, caixa, margem=None, inversa=False):
    """Remove só as cores do mar, preservando a espuma e as cores da ilha."""
    molde = Image.new('1', im.size, color=not margem or inversa)
    if margem:
        ImageDraw.Draw(molde).polygon(margem, fill=not inversa)
    recorte = im.crop(caixa)
    mascara = molde.crop(caixa)
    ativos = {
        (x, y) for y in range(recorte.height) for x in range(recorte.width)
        if mascara.getpixel((x, y)) and recorte.getpixel((x, y))[:3] not in MAR
    }
    # Se a caixa inclui uma ponta da ilha vizinha, não a repita nesta ilha.
    # Espuma e pedrinhas a até três pixels do contorno continuam preservadas.
    grupos = []
    restante = set(ativos)
    while restante:
        componente = {restante.pop()}
        fila = list(componente)
        while fila:
            x, y = fila.pop()
            for u in range(x - 1, x + 2):
                for v in range(y - 1, y + 2):
                    if (u, v) in restante:
                        restante.remove((u, v))
                        componente.add((u, v))
                        fila.append((u, v))
        grupos.append(componente)
    ilha = max(grupos, key=len)
    vizinhanca = {(x + i, y + j) for x, y in ilha for i in range(-3, 4) for j in range(-3, 4)
                   if i * i + j * j <= 9}
    manter = ilha | (ativos & vizinhanca)
    for y in range(recorte.height):
        for x in range(recorte.width):
            if (x, y) not in manter:
                recorte.putpixel((x, y), (0, 0, 0, 0))
    return recorte


def areia_da_deriva(im):
    """Ilhotas pequenas de jade; as silhuetas não funcionam como balsas."""
    d = ImageDraw.Draw(im)
    formas = [
        ([(333, 219), (345, 216), (354, 223), (357, 232), (348, 240),
          (332, 238), (327, 231)], '#e8c893', '#bb9563'),
        ([(350, 244), (369, 239), (387, 243), (392, 254), (384, 267),
          (362, 270), (350, 262), (345, 254)], '#ecd39b', '#bd9c61'),
        ([(324, 248), (330, 244), (339, 247), (340, 255), (331, 260),
          (321, 255)], '#c9b182', '#9a7860'),
    ]
    for pol, areia, sombra in formas:
        d.polygon([(x + 1, y + 4) for x, y in pol], fill='#206b71')
        d.polygon([(x, y + 2) for x, y in pol], fill='#67b3a0')
        d.polygon(pol, fill=sombra)
        d.polygon([(x, y - 2) for x, y in pol], fill=areia)
    # Estratos curtos e dunas; a água entre os bancos fica completamente livre.
    for pontos, ocre, luz in [
        ([(330, 232), (334, 225), (339, 225), (340, 221), (347, 224),
          (351, 228), (347, 233), (339, 234)], '#a99569', '#d4b97e'),
        ([(349, 253), (356, 246), (365, 246), (370, 242), (378, 244),
          (383, 248), (390, 252), (380, 259), (364, 257)], '#a4875e', '#dcbc82'),
        ([(324, 252), (328, 246), (334, 248), (337, 252), (333, 256)],
         '#997852', '#cdae79'),
    ]:
        d.polygon(pontos, fill=ocre)
        d.polygon([(x, y - 2) for x, y in pontos], fill=luz)
        d.line([(x, y - 2) for x, y in pontos[1:4]], fill='#f4dc9f')
    d.line([(331, 235), (334, 235), (340, 238)], fill='#9d7960')
    d.line([(351, 257), (357, 257), (360, 260), (369, 263)], fill='#977757')
    d.line([(378, 261), (383, 259), (387, 257)], fill='#a48660')
    d.line([(330, 233), (334, 237), (342, 237)], fill='#e2f0d4')
    d.line([(352, 259), (361, 265), (371, 265), (378, 262)], fill='#d5efdb')
    d.line([(322, 254), (325, 257)], fill='#d5efdb')
    d.line([(334, 225), (342, 222), (348, 225)], fill='#faf0c7')
    d.line([(356, 247), (371, 244), (384, 248)], fill='#faf0c7')
    for x, y in [(341, 227), (364, 253), (378, 253), (330, 251), (351, 230), (381, 246), (365, 259)]:
        d.line([(x - 2, y), (x, y + 1), (x + 5, y)], fill='#5e7650')
        d.line([(x, y - 2), (x + 1, y), (x + 4, y - 1)], fill='#9ba35b')


def composicao(ilha):
    im = Image.new('RGBA', DIM, HEX_MAR)
    d = ImageDraw.Draw(im)
    for y in range(18, DIM[1] - 10, 31):
        for x in range(13 + y % 17, DIM[0] - 11, 48):
            d.line((x, y, x + 2 + (x + y) % 7, y), fill='#126775')
    im.alpha_composite(ilha)
    assert im.getchannel('A').getextrema() == (255, 255)
    return im


def ilhas_nativas(bloco):
    im = Image.new('RGBA', DIM)
    partes = [
        # Cortes nativos da arte original. Neve e cascata se tocam na fonte.
        (terreno(bloco, (0, 118, 149, 216)), (81, 138)),       # Praia
        (terreno(bloco, (90, 124, 158, 172)), (158, 110)),     # Recifes
        (terreno(bloco, (184, 68, 288, 144), CORTE_NEVE, True), (247, 67)),  # Enseada
        (terreno(bloco, (0, 59, 90, 116)), (361, 120)),        # Grutas
        (terreno(bloco, (122, 0, 218, 53)), (395, 222)),       # Baía
        (terreno(bloco, (184, 12, 288, 74), CORTE_NEVE), (420, 118)),      # Farol
        (terreno(bloco, (154, 137, 283, 206)), (198, 226)),    # Mangue
    ]
    for indice, (pedaco, lugar) in enumerate(partes):
        # Espaço entre marcos mais próximos: duas ilhas usam redução inteira,
        # sem antialiasing, com as outras mantidas no tamanho nativo.
        if indice in (3, 5):
            pedaco = pedaco.crop((0, 0, pedaco.width // 2 * 2, pedaco.height // 2 * 2))
            pedaco = pedaco.resize((pedaco.width // 2, pedaco.height // 2), Image.Resampling.NEAREST)
        assert 0 <= lugar[0] <= DIM[0] - pedaco.width
        assert 0 <= lugar[1] <= DIM[1] - pedaco.height
        im.alpha_composite(pedaco, lugar)
    areia_da_deriva(im)
    # Farol pequeno, sem feixe ou telhado de casa; a luz não passa sobre a rota.
    d = ImageDraw.Draw(im)
    d.rectangle((453, 129, 458, 138), fill='#24374a')
    d.rectangle((454, 130, 457, 137), fill='#f1d9a6')
    d.line((457, 130, 457, 137), fill='#a28a81')
    d.rectangle((452, 127, 459, 129), fill='#576781')
    d.line((453, 126, 458, 126), fill='#d49e72')
    d.line((454, 128, 456, 128), fill='#fbf1cb')
    d.line((452, 138, 459, 138), fill='#777485')
    return im


def main():
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument('saida', type=Path)
    grupo = argumentos.add_mutually_exclusive_group(required=True)
    grupo.add_argument('--ilhas', type=Path, metavar='PNG', help='Camada editável de ilhas já posicionadas.')
    grupo.add_argument('--originais', type=Path, nargs=3, metavar=('BASE', 'RESTAURACAO', 'ESPUMA'))
    argumentos.add_argument('--guardar-ilhas', type=Path, metavar='PNG')
    args = argumentos.parse_args()
    if args.ilhas:
        ilha = Image.open(args.ilhas).convert('RGBA')
        assert ilha.size == DIM and set(ilha.getchannel('A').get_flattened_data()) <= {0, 255}
    else:
        base, restauracao, espuma = args.originais
        b = camada(base, '82bc7cae07b8c8642def59f53f8382fdb322352f')
        r = camada(restauracao, '8d4c510bfc818129a18c47c7e837ffa69e138651')
        e = camada(espuma, '51e61dd63abe480173d4f2f059aedd8c351f0119')
        ilha = ilhas_nativas(Image.alpha_composite(Image.alpha_composite(b, r), e))
    if args.guardar_ilhas:
        ilha.save(args.guardar_ilhas, optimize=True)
    composicao(ilha).convert('RGB').save(args.saida, optimize=True)


if __name__ == '__main__':
    main()
