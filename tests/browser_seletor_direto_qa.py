"""Smoke com o seletor direto e o arquipélago original no navegador real."""
import json
import os
from pathlib import Path
import subprocess

from playwright.sync_api import expect, sync_playwright

from browser_qa import OFFLINE, PRIMEIRA_PAGINA, conferir_ilha_improviso, conferir_jogo, conferir_siri_canonico, jogar, tocar
from browser_audio_qa import conferir_audio_no_ci

CHAVE = 'mare-miuda-entre-ilhas/praia-v1'
REGIOES = [
    ('praia', 'praia', 'primeira-onda', 5),
    ('praia-enseadinha', 'praia', 'praia-fio-de-areia', 8),
    ('recifes', 'recifes', 'recife-pedra-firme', 14),
    ('mangue', 'mangue', 'mangue-dois-encontros', 12),
    ('enseada', 'enseada', 'enseada-sombra-restinga', 14),
    ('deriva', 'deriva', 'deriva-primeira-balsa', 14),
    ('grutas', 'grutas', 'grutas-encaixe', 13),
    ('ressaca', 'ressaca', 'ressaca-dupla-abrigo', 13),
    ('farol', 'farol', 'farol-fragmento-margens', 13),
]


def catalogo_expansao():
    # Usa a mesma base da interface, inclusive em um PR que contém só um lote.
    raiz = Path(__file__).resolve().parents[1]
    js = """
        import { entradasDo } from './src/campanha/index.ts';
        import { travessiasDaExpansao } from './src/fases/expansao/index.ts';
        const mundos = process.argv.slice(1);
        console.log(JSON.stringify(Object.fromEntries(mundos.map(m => {
          const originais = entradasDo(m).filter(entrada => !entrada.destino && !entrada.opcional);
          const ids = originais.map(e => e.id);
          const novas = travessiasDaExpansao(m).filter(t => ids.includes(t.depoisDe));
          return [m, { novas, ids }];
        }))));
    """
    return json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', js, *[m for m, *_ in REGIOES]], cwd=raiz, text=True,
    ))


CATALOGO = catalogo_expansao()
ACOES = dict(cima='U', baixo='D', esquerda='L', direita='R', trocar='X')


def marco(id):
    return f'[data-marco="{id}"]'


def sem_excesso(pagina):
    assert pagina.evaluate('document.documentElement.scrollWidth <= window.innerWidth')


def gravar_fixture(pagina, mundo, concluidas=()):
    pagina.evaluate("""({ chave, mundo, concluidas }) => localStorage.setItem(chave, JSON.stringify({
        versao: 1, progresso: { mundo, posicao: { coluna: 1, linha: 1 }, concluidas, viuTutorial: true },
        audio: { musica: 0, efeitos: 0 },
    }))""", dict(chave=CHAVE, mundo=mundo, concluidas=list(concluidas)))
    pagina.reload()


def conferir_primeiras_fases(pagina, toque):
    erros = []
    pagina.on('pageerror', lambda e: erros.append(str(e)))
    pagina.goto(PRIMEIRA_PAGINA)
    gravar_fixture(pagina, 'praia')
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#moldura-praia')).to_be_hidden()
    expect(pagina.locator('#seletor-fases')).to_be_visible()
    bloqueada = pagina.locator(marco('sombra-da-garca'))
    expect(bloqueada).to_have_attribute('aria-disabled', 'true')
    bloqueada.focus()
    pagina.keyboard.press('Enter')
    expect(pagina.locator('#fase')).to_be_hidden()
    primeira = pagina.locator(marco('primeira-onda'))
    if toque:
        primeira.tap()
    else:
        primeira.focus()
        pagina.keyboard.press('Enter')
    expect(pagina.locator('#nome-fase')).to_be_focused()
    conferir_siri_canonico(pagina, '#tabuleiro')
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#mare')).to_have_text('Alta')
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    expect(primeira).to_have_attribute('data-estado', 'concluida')
    expect(bloqueada).to_have_attribute('data-estado', 'disponivel')
    sem_excesso(pagina)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(primeira).to_have_attribute('data-estado', 'concluida')
    assert not erros, erros


def conferir_mundos(pagina, toque):
    pagina.goto(PRIMEIRA_PAGINA)
    for mundo, tema, fase, total in REGIOES:
        gravar_fixture(pagina, mundo)
        tocar(pagina, '#comecar', toque)
        seletor = pagina.locator('#seletor-fases')
        expect(seletor).to_have_attribute('data-tema', tema)
        # Portas e portos são botões de viagem, não fases extras.
        expect(seletor.locator('button:not([data-categoria="viagem"])')).to_have_count(total + len(CATALOGO[mundo]["novas"]))
        tocar(pagina, marco(fase), toque)
        expect(pagina.locator('#nome-fase')).to_be_visible()
        expect(pagina.locator('#passos')).to_have_text('0')
        sem_excesso(pagina)


def conferir_expansao(pagina, toque):
    mundo = next((m for m, *_ in REGIOES if CATALOGO[m]['novas']), None)
    if mundo is None:
        return
    dados = CATALOGO[mundo]
    primeira, seguinte = dados['novas'][:2]
    fase = primeira['fase']
    id = fase['id']
    pagina.goto(PRIMEIRA_PAGINA)
    gravar_fixture(pagina, mundo)
    tocar(pagina, '#comecar', toque)
    nova = pagina.locator(marco(id))
    expect(nova).to_have_attribute('aria-disabled', 'true')
    nova.focus()
    pagina.keyboard.press('Enter')
    expect(pagina.locator('#fase')).to_be_hidden()
    gravar_fixture(pagina, mundo, dados['ids'])
    tocar(pagina, '#comecar', toque)
    expect(nova).to_have_attribute('data-estado', 'disponivel')
    mesma_ancora = seguinte['depoisDe'] == primeira['depoisDe']
    proxima = pagina.locator(marco(seguinte['fase']['id']))
    if mesma_ancora:
        expect(proxima).to_have_attribute('data-estado', 'bloqueada')
    if toque:
        nova.tap()
    else:
        nova.focus()
        pagina.keyboard.press('Enter')
    expect(pagina.locator('#nome-fase')).to_have_text(fase['nome'])
    jogar(pagina, ''.join(ACOES[acao] for acao in fase['solucao']), toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    expect(nova).to_be_focused()
    expect(nova).to_have_attribute('data-estado', 'concluida')
    if mesma_ancora:
        expect(proxima).to_have_attribute('data-estado', 'disponivel')
    sem_excesso(pagina)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(nova).to_have_attribute('data-estado', 'concluida')


def conferir_arquipelago(pagina, toque):
    pagina.goto(PRIMEIRA_PAGINA)
    gravar_fixture(pagina, 'praia', ('primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'))
    tocar(pagina, '#comecar', toque)
    tocar(pagina, marco('embarque-cabo'), toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
    expect(pagina.locator('#mapa-praia')).to_be_visible()
    expect(pagina.locator('#seletor-fases')).to_be_hidden()
    jogar(pagina, 'RR', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Mangue dos Siris Duplos')
    expect(pagina.locator('#mapa-praia')).to_be_hidden()
    tocar(pagina, marco('porto'), toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')


if __name__ == '__main__':
    motor = os.getenv('MARE_BROWSER', 'chromium')
    caminho = os.getenv('CHROMIUM_PATH') if motor == 'chromium' else None
    with sync_playwright() as playwright, getattr(playwright, motor).launch(executable_path=caminho) as browser:
        for largura in (1180, 320, 390):
            toque = largura < 600
            with browser.new_context(viewport={'width': largura, 'height': 844}, has_touch=toque,
                                     is_mobile=toque, offline=(PRIMEIRA_PAGINA == OFFLINE)) as contexto:
                pagina = contexto.new_page()
                conferir_jogo(pagina, toque)
                conferir_primeiras_fases(pagina, toque)
                conferir_mundos(pagina, toque)
                conferir_expansao(pagina, toque)
                conferir_arquipelago(pagina, toque)
                conferir_ilha_improviso(pagina, toque)
                print(f'{motor}: {largura}px, bancada, travessia, seleção, 8 mundos, save e arquipélago')
        conferir_audio_no_ci(browser, motor, os.getenv('MARE_QA_URL'))
