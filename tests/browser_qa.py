"""Smoke real no Chromium; toque emulado, não aparelho físico."""
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

DIST = Path(__file__).resolve().parents[1] / 'dist'
OFFLINE = (DIST / 'mare-miuda-prototipo.html').as_uri()
PRIMEIRA_PAGINA = os.getenv('MARE_QA_URL') or OFFLINE
KEYS = {'U': 'ArrowUp', 'D': 'ArrowDown', 'L': 'ArrowLeft', 'R': 'ArrowRight'}
BUTTONS = {'U': 'cima', 'D': 'baixo', 'L': 'esquerda', 'R': 'direita'}


def tocar(pagina, seletor, toque=False):
    elemento = pagina.locator(seletor)
    elemento.tap() if toque else elemento.click()


def jogar(pagina, rota, toque=False, mapa=False):
    for direcao in rota:
        if direcao == 'X':
            tocar(pagina, '#trocar-siri', True) if toque else pagina.keyboard.press('Space')
        elif toque:
            tocar(pagina, f'[data-{"mapa-" if mapa else ""}direcao="{BUTTONS[direcao]}"]', True)
        else:
            pagina.keyboard.press(KEYS[direcao])
        if mapa:
            expect(pagina.locator('#praia')).to_have_attribute('aria-busy', 'false')


def conferir_jogo(pagina, toque=False):
    falhas = []
    pagina.on('pageerror', lambda erro: falhas.append(str(erro)))
    pagina.goto(PRIMEIRA_PAGINA)
    marca = pagina.locator('#marca-praia')
    assert marca.evaluate("(img) => img.complete && img.naturalWidth === 180 && img.naturalHeight === 94")
    assert marca.evaluate('(img) => img.clientWidth % img.naturalWidth === 0')
    salvar_captura(pagina, f"abertura-placa-de-areia-{pagina.viewport_size['width']}px")
    tocar(pagina, '#bancada', toque)
    expect(pagina.locator('#nome-fase')).to_have_text('Passagem da primeira onda')
    expect(pagina.locator('footer')).to_contain_text('Luigi Scofano de Araujo')
    expect(pagina.locator('#passos')).to_have_text('0')
    expect(pagina.locator('#sinal-concha')).to_be_visible()
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
    tocar(pagina, '[data-fase="4"]', toque)
    expect(pagina.locator('#orcamento')).to_have_text('Passos restantes: 14')
    expect(pagina.locator('#sinal-concha')).to_be_hidden()
    jogar(pagina, 'UD' * 7, toque)
    expect(pagina.locator('#feedback')).to_contain_text('Os passos acabaram')
    tocar(pagina, '#reiniciar', toque)
    expect(pagina.locator('#fragmento')).to_have_text('Moedas: 0/3')
    jogar(pagina, 'UUDDLLRRDDUURR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#orcamento')).to_have_text('Passos restantes: 0')
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
    pagina.goto(PRIMEIRA_PAGINA)
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#titulo-praia')).to_be_visible()
    expect(pagina.locator('#saidas-praia')).to_contain_text('→ Primeira onda')
    # Injeção síncrona: as entradas seguintes chegam na mesma janela de travessia.
    pagina.evaluate("""() => {
        const direita = document.querySelector('[data-mapa-direcao="direita"]');
        const esquerda = document.querySelector('[data-mapa-direcao="esquerda"]');
        window.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', repeat:true}));
        if (document.querySelector('#praia').getAttribute('aria-busy') !== 'false') throw Error('Repetição iniciou viagem');
        direita.click();
        if (document.querySelector('#praia').getAttribute('aria-busy') !== 'true') throw Error('Não iniciou viagem');
        if (!document.querySelector('#entrar-fase').disabled) throw Error('Abriu entrada em movimento');
        esquerda.click();
        direita.click();
    }""")
    expect(pagina.locator('#praia')).to_have_attribute('aria-busy', 'false')
    expect(pagina.locator('#posicao-praia')).to_contain_text('Primeira onda')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#lembrete-fase')).to_be_visible()
    jogar(pagina, 'RRR', toque)
    tocar(pagina, '#voltar-fase', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/4')
    if opcional:
        jogar(pagina, 'D', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        jogar(pagina, 'RLDDRRRRU', toque)
        expect(pagina.locator('#feedback')).to_contain_text('Atalho de volta aberto')
        tocar(pagina, '#voltar-fase', toque)
        salvar_captura(pagina, 'praia-ramo-perolado-desktop')
        jogar(pagina, 'UR', toque, mapa=True)
    else:
        jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRDURR', toque)
    tocar(pagina, '#voltar-fase', toque)
    if opcional:
        jogar(pagina, 'LDD', toque, mapa=True)
    else:
        jogar(pagina, 'R', toque, mapa=True)
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


SOLUCOES = {
    'Recifes Expostos': ('RRDUDURRR', 'RRRDUDULLLRLLLLDRLRURRU', 'DDDUDURRUDUDDRRLRLLUUDUDLLDUDUUUR'),
    'Mangue dos Dois Siris': ('RXLL', 'RRXRRXRR', 'RRRLRLXRRRRXRRRXRU'),
}


def conferir_lote(pagina, toque=False, recifes_primeiro=True):
    tocar(pagina, '#voltar-creditos', toque)
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#entrar-fase')).to_have_text('Seguir para o arquipélago')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
    ordem = ['Recifes Expostos', 'Mangue dos Dois Siris']
    if not recifes_primeiro:
        ordem.reverse()
    rotas = ['RU', 'DR'] if recifes_primeiro else ['RR', 'LU']

    for indice, (nome, caminho) in enumerate(zip(ordem, rotas)):
        jogar(pagina, caminho, toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text(nome)
        for fase, solucao in enumerate(SOLUCOES[nome]):
            jogar(pagina, 'R' if fase == 0 else 'R', toque, mapa=True)
            if indice == 0 and fase == 1:
                pagina.reload()
                tocar(pagina, '#comecar', toque)
                expect(pagina.locator('#titulo-praia')).to_have_text(nome)
                expect(pagina.locator('#progresso-praia')).to_contain_text('1/3')
            tocar(pagina, '#entrar-fase', toque)
            if fase == 1 and not toque:
                quantidade = 3 if nome == 'Recifes Expostos' else 5
                jogar(pagina, solucao[:quantidade], toque)
                if nome == 'Recifes Expostos':
                    expect(pagina.locator('#fragmento')).to_have_text('Fragmentos: 1/2')
                    salvar_captura(pagina, 'recifes-partida-desktop')
                else:
                    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
                    expect(pagina.locator('#passos')).to_have_text('4')
                    salvar_captura(pagina, 'mangue-partida-desktop')
                solucao = solucao[quantidade:]
            jogar(pagina, solucao, toque)
            expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
            tocar(pagina, '#voltar-fase', toque)
        expect(pagina.locator('#progresso-praia')).to_contain_text('3/3')
        jogar(pagina, 'D', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
        if indice == 0:
            expect(pagina.locator('#enseada-aberta')).to_be_hidden()

    jogar(pagina, 'LUR' if recifes_primeiro else 'R', toque, mapa=True)
    expect(pagina.locator('#enseada-aberta')).to_be_visible()
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('ainda não disponível')
    if not toque:
        salvar_captura(pagina, 'arquipelago-desktop')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_enseadinha(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1,
        progresso: {posicao: {coluna: 7, linha: 1}, viuTutorial: true,
          concluidas: ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#viagem-praia')).to_contain_text('1/2')
    expect(pagina.locator('#cabo-baixo')).to_have_js_property('naturalWidth', 192)
    salvar_captura(pagina, f"cabo-baixo-navegavel-{pagina.viewport_size['width']}px")
    jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#viagem-praia')).to_contain_text('2/2')
    expect(pagina.locator('#entrar-fase')).to_have_text('Voltar ao Cabo Baixo')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#entrar-fase')).to_have_text('Ir à Enseadinha')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RR', toque, mapa=True)  # Segundo avanço bloqueado.
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Conclua Fio de areia')
    for indice, (solucao, desvio) in enumerate([
        ('RRRDUDURR', ('D', 'RDRRRLLLU', 'U')),
        ('RRDUDULLUDUDLLDUDURRU', ('U', 'RURRRLRDR', 'D')),
        ('RRDUDRR', ('D', 'UUDRDRRRRUDUDLLUU', 'U')),
    ]):
        tocar(pagina, '#entrar-fase', toque)
        jogar(pagina, solucao, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        tocar(pagina, '#voltar-fase', toque)
        if indice == 0:
            pagina.reload()
            tocar(pagina, '#comecar', toque)
            expect(pagina.locator('#viagem-praia')).to_contain_text('2/2')
            expect(pagina.locator('#progresso-praia')).to_contain_text('1/3')
            salvar_captura(pagina, f"enseadinha-prototipo-{pagina.viewport_size['width']}px")
        if not toque:
            ida, comandos, volta = desvio
            jogar(pagina, ida, mapa=True)
            tocar(pagina, '#entrar-fase')
            jogar(pagina, comandos)
            expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
            tocar(pagina, '#voltar-fase')
            jogar(pagina, volta, mapa=True)
        jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#viagem-praia')).to_contain_text('1/2')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


with sync_playwright() as p:
    motor = os.getenv('MARE_BROWSER', 'chromium')
    if motor not in ('chromium', 'webkit'):
        raise ValueError('MARE_BROWSER precisa ser chromium ou webkit.')
    caminho = os.getenv('CHROMIUM_PATH') if motor == 'chromium' else None
    navegador = getattr(p, motor).launch(executable_path=caminho)
    desktop = navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=(PRIMEIRA_PAGINA == OFFLINE))
    conferir_jogo(desktop)
    print('Desktop 1180 × 820: três fases, teclado, erros, reinício, pintura e HTML offline.')
    conferir_praia(desktop, opcional=True)
    conferir_lote(desktop)
    conferir_enseadinha(navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=(PRIMEIRA_PAGINA == OFFLINE)))
    print(f'{motor}: desktop com Praia, Recifes → Mangue, reload, atalhos, troca e enseada futura.')
    for largura in [320, 390]:
        aparelho = navegador.new_page(viewport={'width': largura, 'height': 844}, has_touch=True,
                                     is_mobile=True, device_scale_factor=2, offline=(PRIMEIRA_PAGINA == OFFLINE))
        conferir_jogo(aparelho, toque=True)
        conferir_praia(aparelho, toque=True, opcional=False)
        conferir_lote(aparelho, toque=True, recifes_primeiro=False)
        conferir_enseadinha(aparelho, toque=True)
        print(f'{motor}: toque emulado {largura} × 844 na ordem Mangue → Recifes, reload e encaixe integral.')
    navegador.close()
