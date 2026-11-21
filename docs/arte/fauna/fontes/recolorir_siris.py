"""Exporta o Coral e duas trocas de paleta, sem alterar a geometria."""
from pathlib import Path
from PIL import Image

PALETAS = {
    'verde': {
        (219, 92, 88, 255): (96, 134, 75, 255),
        (251, 149, 109, 255): (164, 194, 110, 255),
        (255, 197, 163, 255): (207, 224, 151, 255),
        (255, 239, 190, 255): (246, 245, 194, 255),
    },
    'amarelo': {
        (219, 92, 88, 255): (188, 119, 38, 255),
        (251, 149, 109, 255): (240, 182, 64, 255),
        (255, 197, 163, 255): (255, 215, 119, 255),
        (255, 239, 190, 255): (255, 243, 189, 255),
    },
}

def exportar(origem: Image.Image, pasta: Path) -> None:
    """Recolore as quatro cores de carapaça e preserva contorno e alfa."""
    assert origem.size == (31, 23)
    alfa = origem.getchannel('A')
    assert set(alfa.get_flattened_data()) == {0, 255}
    pasta.mkdir(exist_ok=True, parents=True)
    origem.save(pasta/'siri-coral.png')
    for nome, cores in PALETAS.items():
        pixels = list(origem.get_flattened_data())
        assert set(cores).issubset(pixels) and len(set(cores.values())) == len(cores)
        variante = Image.new('RGBA', origem.size)
        variante.putdata([cores.get(pixel, pixel) for pixel in pixels])
        assert variante.getchannel('A').tobytes() == alfa.tobytes()
        assert [cores.get(px, px) for px in pixels] == list(variante.get_flattened_data())
        variante.save(pasta/f'siri-{nome}.png')

if __name__ == '__main__':
    import argparse
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('base', type=Path, help='PNG original do Coral de 31 × 23 ou logo de 180 × 94')
    cli.add_argument('destino', type=Path)
    arg = cli.parse_args()
    sprite = Image.open(arg.base).convert('RGBA')
    if sprite.size == (180, 94):
        sprite = sprite.crop((75, 3, 106, 26))
    exportar(sprite, arg.destino)
