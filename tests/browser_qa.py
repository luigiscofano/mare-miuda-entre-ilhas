"""Smoke real no Chromium; toque emulado, não aparelho físico."""
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

DIST = Path(__file__).resolve().parents[1] / 'dist'
OFFLINE = (DIST / 'mare-miuda-prototipo.html').as_uri()
KEYS = {'U': 'ArrowUp', 'D': 'ArrowDown', 'L': 'ArrowLeft', 'R': 'ArrowRight'}
BUTTONS = {'U': 'cima', 'D': 'baixo', 'L': 'esquerda', 'R': 'direita'}


def tocar(pagina, seletor, toque=False):
    elemento = pagina.locator(seletor)
    elemento.tap() if toque else elemento.click()


def jogar(pagina, rota, toque=False, mapa=False):
    for direcao in rota:
        if toque:
            tocar(pagina, f'[data-{"mapa-" if mapa else ""}direcao="{BUTTONS[direcao]}"]', True)
        else:
            pagina.keyboard.press(KEYS[direcao])


def conferir_jogo(pagina, toque=False):
    falhas = []
    pagina.on('pageerror', lambda erro: falhas.append(str(erro)))
    pagina.goto(OFFLINE)
    marca = pagina.locator('#marca-praia')
    assert marca.evaluate("(img) => img.complete && img.naturalWidth === 180 && img.naturalHeight === 94")
    assert marca.evaluate('(img) => img.clientWidth % img.naturalWidth === 0')
    salvar_captura(pagina, f"abertura-placa-de-areia-{pagina.viewport_size['width']}px")
    tocar(pagina, '#bancada', toque)
    expect(pagina.locator('#nome-fase')).to_have_text('Passagem da primeira onda')
    expect(pagina.locator('footer')).to_contain_text('Luigi Scofano de Araujo')
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'L', toque)
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#mare')).to_have_text('Alta')
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#passos')).to_have_text('3')
    pagina.locator('[data-fase="2"]').tap() if toque else pagina.locator('[data-fase="2"]').click()
    jogar(pagina, 'RR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Garça no próximo passo')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    pagina.locator('#reiniciar').tap() if toque else pagina.keyboard.press('r')
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'RRDURR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    pagina.locator('[data-fase="3"]').tap() if toque else pagina.locator('[data-fase="3"]').click()
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#feedback')).to_contain_text('encontre o fragmento')
    pagina.locator('#reiniciar').tap() if toque else pagina.keyboard.press('r')
    jogar(pagina, 'DDRLRLUUR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#fragmento')).to_have_text('Fragmento no inventário')
    pagina.locator('#reiniciar').tap() if toque else pagina.keyboard.press('r')
    expect(pagina.locator('#fragmento')).to_have_text('Fragmento ainda na ilha')
    expect(pagina.locator('#mare')).to_have_text('Baixa')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth'), 'A página transbordou.'
    assert pagina.locator('#tabuleiro').evaluate('(canvas) => canvas.clientWidth % canvas.width === 0')
    assert pagina.locator('#tabuleiro').evaluate("""(canvas) => {
        const rgba = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        for (let i=0;i<rgba.length;i+=4)
          if (rgba[i+3]!==255 || Math.max(rgba[i],rgba[i+1],rgba[i+2]) - Math.min(rgba[i],rgba[i+1],rgba[i+2])>14) return false;
        return true;
    }"""), 'O palco deve ser opaco, em tons de cinza.'
    assert not falhas, falhas


def salvar_captura(pagina, nome):
    destino = os.environ.get('MARE_CAPTURA_DIR')
    if destino:
        pasta = Path(destino)
        pasta.mkdir(parents=True, exist_ok=True)
        pagina.mouse.move(0, 0)
        pagina.screenshot(path=pasta / (nome + '.png'), full_page=True)


def conferir_praia(pagina, toque=False, opcional=False):
    erros = []
    pagina.on('pageerror', lambda erro: erros.append(str(erro)))
    pagina.goto(OFFLINE)
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#titulo-praia')).to_be_visible()
    jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#lembrete-fase')).to_be_visible()
    jogar(pagina, 'RRR', toque)
    tocar(pagina, '#voltar-fase', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/4')
    if opcional:
        jogar(pagina, 'RDD', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        jogar(pagina, 'RLDDRRRRU', toque)
        expect(pagina.locator('#feedback')).to_contain_text('Atalho de volta aberto')
        tocar(pagina, '#voltar-fase', toque)
        salvar_captura(pagina, 'praia-ramo-perolado-desktop')
        jogar(pagina, 'UUR', toque, mapa=True)
    else:
        jogar(pagina, 'RR', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRDURR', toque)
    tocar(pagina, '#voltar-fase', toque)
    if opcional:
        jogar(pagina, 'LDDDRRURUU', toque, mapa=True)
    else:
        jogar(pagina, 'RR', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Busca e volta')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'DDRLRLUUR', toque)
    tocar(pagina, '#voltar-fase', toque)
    if not toque:
        tocar(pagina, '.configuracao summary')
        pagina.locator('#volume-musica').fill('0')
        expect(pagina.locator('#volume-musica')).to_have_value('0')
    pagina.reload()
    expect(pagina.locator('#comecar')).to_have_text('Continuar viagem')
    if not toque:
        expect(pagina.locator('#volume-musica')).to_have_value('0')
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Busca e volta · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/4')
    jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRRDD', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Garça no próximo passo')
    tamanho = pagina.viewport_size['width']
    salvar_captura(pagina, f'encontro-antes-da-garca-{tamanho}px')
    jogar(pagina, 'LRRRU', toque)
    tocar(pagina, '#seguir-fase', toque)
    expect(pagina.locator('#desfecho')).to_contain_text('primeira viagem termina')
    expect(pagina.locator('footer')).to_contain_text('Luigi Scofano de Araujo')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth'), 'A página transbordou.'
    assert not erros, erros


with sync_playwright() as p:
    navegador = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH'))
    desktop = navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=True)
    conferir_jogo(desktop)
    print('Desktop 1180 × 820: três fases, teclado, erros, reinício, pintura e HTML offline.')
    conferir_praia(desktop, opcional=True)
    print('Desktop: mapa, desvio opcional, atalho, reload, encontro e créditos.')
    for largura in [320, 390]:
        aparelho = navegador.new_page(viewport={'width': largura, 'height': 844}, has_touch=True,
                                     is_mobile=True, device_scale_factor=2, offline=True)
        conferir_jogo(aparelho, toque=True)
        conferir_praia(aparelho, toque=True, opcional=False)
        print(f'Toque emulado {largura} × 844: bancada, rota principal, reload e encaixe integral.')
    navegador.close()
