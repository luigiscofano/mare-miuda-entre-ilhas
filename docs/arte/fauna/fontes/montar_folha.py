"""Monta a folha nativa sem transformar nenhum dos cinco PNGs."""
from pathlib import Path
import sys

from PIL import Image

ORDEM = ('siri-coral', 'siri-verde', 'siri-amarelo', 'garca-patrulha', 'garca-rasante')
LARGURA, ALTURA = 31, 23


def montar(pasta: Path) -> None:
    folha = Image.new('RGBA', (LARGURA * len(ORDEM), ALTURA))
    for indice, nome in enumerate(ORDEM):
        with Image.open(pasta / f'{nome}.png') as original:
            sprite = original.convert('RGBA')
        assert sprite.size == (LARGURA, ALTURA)
        assert set(sprite.getchannel('A').get_flattened_data()) == {0, 255}
        folha.paste(sprite, (indice * LARGURA, 0))
    folha.save(pasta / 'spritesheet.png')


if __name__ == '__main__':
    montar(Path(sys.argv[1]))
