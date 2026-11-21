"""Verificação dos tabuleiros conceituais; não usa o motor do jogo."""
from collections import deque

from carta import WORLDS

PASSOS = ((0, -1, 'N'), (1, 0, 'L'), (0, 1, 'S'), (-1, 0, 'O'))
SOLO_FIRME = frozenset('S.HC')
CICLO_MARE = 6


def caminho(tabuleiro):
    """Busca a menor rota a partir da maré baixa, sem pisar em água."""
    inicio, = (
        (x, y)
        for y, linha in enumerate(tabuleiro)
        for x, celula in enumerate(linha)
        if celula == 'S'
    )
    fila = deque([(inicio, 0, '')])
    vistos = {(inicio, 0)}

    while fila:
        (x, y), turno, rota = fila.popleft()
        if tabuleiro[y][x] == 'C':
            return rota

        proximo = (turno + 1) % CICLO_MARE
        for dx, dy, direcao in PASSOS:
            nx, ny = x + dx, y + dy
            if not (0 <= ny < len(tabuleiro) and 0 <= nx < len(tabuleiro[ny])):
                continue

            celula = tabuleiro[ny][nx]
            # O baixio precisa estar seco na entrada e depois de avançar o turno.
            livre = celula in SOLO_FIRME or (celula == '=' and turno < 3 and proximo < 3)
            estado = ((nx, ny), proximo)
            if livre and estado not in vistos:
                vistos.add(estado)
                fila.append((estado[0], proximo, rota + direcao))
    return None


if __name__ == '__main__':
    for nome, _, tabuleiro in WORLDS:
        rota = caminho(tabuleiro)
        if rota is None:
            raise SystemExit(f'{nome}: sem caminho no modelo simplificado')
        print(f'{nome}: {rota}')
