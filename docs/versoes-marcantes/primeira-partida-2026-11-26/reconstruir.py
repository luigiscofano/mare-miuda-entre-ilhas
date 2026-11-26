#!/usr/bin/env python3
"""Reconstrói a edição histórica sem trocar de branch nem editar o checkout."""
import argparse
import hashlib
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]
BASE = "205df4e4259b9c866fe8305b87dad1dfa94c00e5"
IDENTIDADES = {
    "Jogar-agora.html": (19_320_663, "a6e5c5aee9fe846240b795505ec4437ed8ee07c23f1c65529fa53b53430f802e"),
    "web/index.html": (507_911, "513dbfe37c43229cc022ebb20e4563d63a0b31f5cd8a909f30ddf55ecdb1e313"),
}

WEB_ARQUIVOS = 1_427
WEB_SHA256 = "b1b835c8180184d3252a7d6e90ffd3722f74512656ddfe583f405979baec3841"


def reconstruir(destino):
    if destino.exists():
        raise SystemExit(f"Escolha uma pasta de destino que ainda não exista: {destino}")

    with tempfile.TemporaryDirectory(prefix="mare-marco-") as temporaria:
        origem = Path(temporaria) / "origem"
        saida = Path(temporaria) / "saida"
        origem.mkdir()
        saida.mkdir()
        # Exportamos a revisão aprovada; a branch atual não entra na montagem.
        with tempfile.TemporaryFile() as arquivo:
            try:
                subprocess.run(
                    ["git", "archive", BASE, "edicao-oficial"], cwd=RAIZ,
                    stdout=arquivo, check=True,
                )
            except subprocess.CalledProcessError as erro:
                raise SystemExit(
                    "A revisão-base não está neste clone. Use um clone completo "
                    "ou obtenha seu histórico antes de reconstruir."
                ) from erro
            arquivo.seek(0)
            subprocess.run(["tar", "-xf", "-", "-C", str(origem)], stdin=arquivo, check=True)

        subprocess.run(["git", "apply", str(AQUI / "primeira-partida.patch")], cwd=origem, check=True)
        montar = origem / "edicao-oficial" / "montar_previa.py"
        for nome in IDENTIDADES:
            argumentos = ["--web"] if nome.startswith("web/") else []
            subprocess.run([sys.executable, str(montar), str(saida / nome), *argumentos], check=True)

        shutil.copyfile(AQUI / "Outras-travessias.html", saida / "Outras-travessias.html")
        shutil.copyfile(AQUI / "amostras-web.html", saida / "web" / "Outras-travessias.html")
        shutil.copyfile(AQUI / "TESTE-COM-3-JOGADORES.txt", saida / "TESTE-COM-3-JOGADORES.txt")

        # Só copiamos o resultado para o usuário depois de validar as entradas.
        for nome, (tamanho, esperado) in IDENTIDADES.items():
            dados = (saida / nome).read_bytes()
            calculado = hashlib.sha256(dados).hexdigest()
            if (len(dados), calculado) != (tamanho, esperado):
                raise SystemExit(f"Reconstrução divergiu da edição aprovada: {nome}")
            print(f"{nome}: SHA-256 {calculado}")
        web = saida / "web"
        arquivos = sorted(p for p in web.rglob("*") if p.is_file())
        manifesto = hashlib.sha256()
        # O nome relativo e os 32 bytes do hash de cada arquivo formam
        # a assinatura da árvore, incluindo imagens, áudio e módulos.
        for arquivo in arquivos:
            manifesto.update(arquivo.relative_to(web).as_posix().encode() + b"\0")
            manifesto.update(hashlib.sha256(arquivo.read_bytes()).digest())
        if len(arquivos) != WEB_ARQUIVOS or manifesto.hexdigest() != WEB_SHA256:
            raise SystemExit("A árvore Web não corresponde à versão aprovada.")
        print(f"Web: {len(arquivos)} arquivos, assinatura {manifesto.hexdigest()}")
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(saida, destino)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destino", type=Path, help="pasta nova onde salvar a cópia histórica")
    reconstruir(parser.parse_args().destino.resolve())
