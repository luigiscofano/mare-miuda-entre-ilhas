"""Smoke real no Chromium; toque emulado, não aparelho físico."""
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

DIST = Path(__file__).resolve().parents[1] / 'dist'
OFFLINE = (DIST / 'mare-miuda-prototipo.html').as_uri()
KEYS = {'U': 'ArrowUp', 'D': 'ArrowDown', 'L': 'ArrowLeft', 'R': 'ArrowRight'}
BUTTONS = {'U': 'cima', 'D': 'baixo', 'L': 'esquerda', 'R': 'direita'}


def jogar(pagina, rota, toque=False):
    for direcao in rota:
        if toque:
            pagina.locator(f'[data-direcao="{BUTTONS[direcao]}"]').tap()
        else:
            pagina.keyboard.press(KEYS[direcao])


def conferir_jogo(pagina, toque=False):
    falhas = []
    pagina.on('pageerror', lambda erro: falhas.append(str(erro)))
    pagina.goto(OFFLINE)
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
          if (rgba[i+3]!==255 || Math.max(rgba[i],rgba[i+1],rgba[i+2]) - Math.min(rgba[i],rgba[i+1],rgba[i+2])>9) return false;
        return true;
    }"""), 'O palco deve ser opaco, em tons de cinza.'
    assert not falhas, falhas


with sync_playwright() as p:
    navegador = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', 'chromium'), args=['--no-sandbox'])
    desktop = navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=True)
    conferir_jogo(desktop)
    print('Desktop 1180 × 820: três fases, teclado, erros, reinício, pintura e HTML offline.')
    desktop.locator('[data-fase="2"]').click()
    jogar(desktop, 'RR')
    captura = os.environ.get('MARE_CAPTURA')
    if captura:
        desktop.mouse.move(0, 0)
        desktop.screenshot(path=captura, full_page=True)
    for largura in [320, 390]:
        aparelho = navegador.new_page(viewport={'width': largura, 'height': 844}, has_touch=True,
                                     is_mobile=True, device_scale_factor=2, offline=True)
        conferir_jogo(aparelho, toque=True)
        print(f'Toque emulado {largura} × 844: três fases, reinício e encaixe integral.')
    navegador.close()
