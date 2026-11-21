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


def conferir_siri_canonico(pagina, seletor, cinza=False):
    assert pagina.locator(seletor).evaluate("""(canvas, cinza) => {
        const logo = document.querySelector('#marca-praia');
        if (!logo.complete) return false;
        const w = 31, h = 23;
        const recorte = document.createElement('canvas');
        recorte.width = w;
        recorte.height = h;
        const ctx = recorte.getContext('2d');
        ctx.drawImage(logo, 75, 3, w, h, 0, 0, w, h);
        const fonte = ctx.getImageData(0, 0, w, h).data;
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        const pontos = [];
        for (let i = 0; i < fonte.length; i += 4) {
          if (fonte[i + 3] === 255) pontos.push([i, Math.floor(i / 4) % w, Math.floor(i / (4 * w))]);
          else if (fonte[i + 3] !== 0) return false;
        }
        if (pontos.length !== 447 || canvas.width !== 512 || canvas.height !== 384) return false;
        if ((2 * canvas.clientWidth) % canvas.width !== 0) return false;
        for (let y = 0; y <= canvas.height - h; y++) for (let x = 0; x <= canvas.width - w; x++) {
          if (!pontos.every(([i, dx, dy]) => {
            const p = 4 * ((y + dy) * canvas.width + x + dx);
            return fonte[i] === pixels[p] && fonte[i + 1] === pixels[p + 1]
              && fonte[i + 2] === pixels[p + 2] && pixels[p + 3] === 255;
          })) continue;
          if (!cinza) return true;
          // Só o recorte oficial tem cor; o terreno da bancada continua neutro.
          for (let i = 0; i < pixels.length; i += 4) {
            const col = (i / 4) % canvas.width, linha = Math.floor(i / (4 * canvas.width));
            if (pixels[i + 3] !== 255) return false;
            if (col >= x && col < x + w && linha >= y && linha < y + h) continue;
            if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2])
              - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 14) return false;
          }
          return true;
        }
        return false;
    }""", cinza), 'O siri precisa ser o recorte exato da logo na tela visível.'


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
    conferir_siri_canonico(pagina, '#tabuleiro', cinza=True)
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
    conferir_siri_canonico(pagina, '#mapa-praia')
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
    'Mangue dos Siris Duplos': ('RXLL', 'RRXRRXRR', 'RRRLRLXRRRRXRRRXRU'),
}


def conferir_lote(pagina, toque=False, recifes_primeiro=True):
    tocar(pagina, '#voltar-creditos', toque)
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#entrar-fase')).to_have_text('Seguir para o arquipélago')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
    conferir_siri_canonico(pagina, '#mapa-praia')
    ordem = ['Recifes Expostos', 'Mangue dos Siris Duplos']
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
                expect(pagina.locator('#progresso-praia')).to_contain_text('1/10')
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
        expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
        jogar(pagina, 'D', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
        if indice == 0:
            expect(pagina.locator('#enseada-aberta')).to_be_hidden()

    jogar(pagina, 'LUR' if recifes_primeiro else 'R', toque, mapa=True)
    expect(pagina.locator('#enseada-aberta')).to_be_visible()
    if not toque:
        salvar_captura(pagina, 'arquipelago-desktop')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_recifes_ampliados(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'recifes', posicao: {coluna: 2, linha: 1},
            viuTutorial: true, concluidas: ['recife-pedra-firme', 'recife-duas-pocas']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('2/10')
    jogar(pagina, 'U', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Degraus da vazante')
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Degraus da vazante')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRDUDDRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'DRD', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Fio de coral · opcional')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'DUDUDDRRRUDURR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Fio de coral · opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    salvar_captura(pagina, f"recifes-ampliados-{pagina.viewport_size['width']}px")
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_mangue_ampliado(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'mangue', posicao: {coluna: 2, linha: 1},
            viuTutorial: true, concluidas: ['mangue-dois-encontros']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/10')
    jogar(pagina, 'UR', toque, mapa=True)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Conclua Duas veredas')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#passos')).to_have_text('3')
    jogar(pagina, 'X', toque)
    expect(pagina.locator('#passos')).to_have_text('3')
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    jogar(pagina, 'LLL', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RXRR', toque)
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    expect(pagina.locator('#nome-fase')).to_be_focused()
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'RRDURRX', toque)
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    expect(pagina.locator('#passos')).to_have_text('6')
    jogar(pagina, 'RRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Janela partilhada · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    salvar_captura(pagina, f"mangue-ampliado-{pagina.viewport_size['width']}px")
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_enseada_ampliada(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'enseada', posicao: {coluna: 2, linha: 1},
            viuTutorial: true, concluidas: ['enseada-sombra-restinga']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/10')
    jogar(pagina, 'UR', toque, mapa=True)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Complete Um passo antes da sombra')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Garça no próximo passo')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'DRRRUR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Um passo antes da sombra · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('2/10')
    salvar_captura(pagina, f"enseada-ampliada-{pagina.viewport_size['width']}px")
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_deriva_ampliada(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    # Retoma no quarto marco do ramo para testar o tabuleiro mais largo e a dupla.
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'deriva', posicao: {coluna: 8, linha: -1},
            viuTutorial: true, concluidas: ['deriva-primeira-balsa', 'deriva-duas-margens',
              'deriva-um-passo-ao-cais', 'deriva-cais-da-alta', 'deriva-duas-rampas',
              'deriva-ida-e-retorno', 'deriva-dois-ancoradouros']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Balsas alternadas')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Balsa 2')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    salvar_captura(pagina, f"deriva-balsas-alternadas-{pagina.viewport_size['width']}px")
    jogar(pagina, 'RRRRDUDURRRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'RRD', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Tripulação partilhada')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRX', toque)
    expect(pagina.locator('#passos')).to_have_text('2')
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    expect(pagina.locator('#posicao')).to_contain_text('coluna 3, linha 1')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#passos')).to_have_text('3')
    expect(pagina.locator('#posicao')).to_contain_text('coluna 5, linha 1')
    expect(pagina.locator('#feedback')).to_contain_text('A balsa levou o siri')
    jogar(pagina, 'RRXRRRXR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Tripulação partilhada · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('9/10')


def conferir_grutas_ampliadas(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    # Retoma o último marco do ramo com as fases que o tornam acessível.
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'grutas', posicao: {coluna: 10, linha: -1},
            viuTutorial: true, concluidas: ['grutas-encaixe', 'grutas-dupla-portao',
              'grutas-alavanca-da-entrada', 'grutas-dobra-da-camara',
              'grutas-coral-portador', 'grutas-alavanca-distante']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Boca do labirinto')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'R', toque)
    inventario = pagina.locator('#fragmento')
    expect(inventario).to_contain_text('Pérola com o siri coral')
    expect(inventario).to_contain_text('Fragmento ainda na ilha')
    jogar(pagina, 'RRRR', toque)
    expect(inventario).to_contain_text('Alavanca B')
    jogar(pagina, 'LXRRRRRR', toque)
    expect(inventario).to_contain_text('Portão aberto')
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    jogar(pagina, 'XDDRRRRXRRRXU', toque)
    expect(inventario).to_contain_text('Portão aberto')
    expect(inventario).to_contain_text('Fragmento no inventário')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    salvar_captura(pagina, f"grutas-boca-do-labirinto-{pagina.viewport_size['width']}px")
    jogar(pagina, 'DRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Boca do labirinto · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('7/10')


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


def conferir_lote2(pagina, toque=False):
    fases = {
        'Enseada da Garça': ['RRDURR', 'RRRDUDURR', 'RRDUDUDRRLLUL'],
        'Ilhas à Deriva': ['RRRRR', 'RRRRRUUDLDRLLUUUULLLL', 'RRRRDURLRR'],
    }
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Conclua o trecho')
    for mundo, solucoes in fases.items():
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text(mundo)
        for indice, solucao in enumerate(solucoes):
            jogar(pagina, 'R', toque, mapa=True)
            tocar(pagina, '#entrar-fase', toque)
            if indice == 0:
                jogar(pagina, solucao[:2], toque)
                aviso = 'Garça no próximo passo' if mundo.startswith('Enseada') else 'Na virada: Balsa 1'
                expect(pagina.locator('#previsao')).to_contain_text(aviso)
                if not toque:
                    salvar_captura(pagina, f"lote2-{'garca' if mundo.startswith('Enseada') else 'balsa'}-desktop")
                solucao = solucao[2:]
            jogar(pagina, solucao, toque)
            expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
            tocar(pagina, '#voltar-fase', toque)
        jogar(pagina, 'U', toque, mapa=True)
        expect(pagina.locator('#posicao-praia')).to_contain_text('opcional')
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#trocar-siri')).to_be_visible()
        rota = 'RRRLXRRRXRRR' if mundo.startswith('Enseada') else 'RRRXRRXRRXDRR'
        jogar(pagina, rota, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        tocar(pagina, '#reiniciar', toque)
        expect(pagina.locator('#passos')).to_have_text('0')
        expect(pagina.locator('#erros')).to_have_text('0 / 3')
        tocar(pagina, '#voltar-fase', toque)
        expect(pagina.locator('#posicao-praia')).to_contain_text('concluída')
        jogar(pagina, 'R', toque, mapa=True)
        nome, rota = (
            ('Revezamento na restinga', 'RRDUDURXRRRRXRRXRRXRRXR') if mundo.startswith('Enseada')
            else ('Balsas na contramão', 'RRRXRRXRRXDDRXRRRDDUURRXL')
        )
        expect(pagina.locator('#posicao-praia')).to_contain_text(nome)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#trocar-siri')).to_be_visible()
        jogar(pagina, rota, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        expect(pagina.locator('#erros')).to_have_text('0 / 3')
        tocar(pagina, '#voltar-fase', toque)
        pagina.reload()
        tocar(pagina, '#comecar', toque)
        expect(pagina.locator('#posicao-praia')).to_contain_text(nome)
        expect(pagina.locator('#posicao-praia')).to_contain_text('concluída')
        jogar(pagina, 'LD', toque, mapa=True)
        pagina.reload()
        tocar(pagina, '#comecar', toque)
        expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
        jogar(pagina, 'D', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
        if mundo.startswith('Enseada'):
            jogar(pagina, 'R', toque, mapa=True)
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_grutas(pagina, toque=False):
    jogar(pagina, 'U', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Grutas da Espuma')
    solucoes = ['RUDRRRR', 'RRRUDLLRRRR', 'RDUDURRRRLRLLLUDUDRRRRR', 'RRXRRRRXRRR', 'XRRXRLRRXRRRXRRRRXR']
    for indice, rota in enumerate(solucoes):
        jogar(pagina, 'R', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        if indice == 1:
            jogar(pagina, 'R', toque)
            expect(pagina.locator('#feedback')).to_contain_text('Próxima etapa: Encaixe A')
            jogar(pagina, 'L', toque)
        if indice == 0:
            jogar(pagina, rota[:2], toque)
            expect(pagina.locator('#fragmento')).to_contain_text('Pérola no inventário')
            rota = rota[2:]
        jogar(pagina, rota, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('5/10')
    jogar(pagina, 'D', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')

    jogar(pagina, 'R', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Baía da Ressaca')
    for rota in ['RRRDUDXRRRXURXDRXRR', 'RRRLRRRXRRRXRXDXRXURRRDRR']:
        jogar(pagina, 'R', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#trocar-siri')).to_be_visible()
        expect(pagina.locator('#previsao')).to_contain_text('Na virada: Balsa')
        jogar(pagina, rota, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        tocar(pagina, '#voltar-fase', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('2/2')
    jogar(pagina, 'D', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')


def conferir_farol(pagina, toque=False):
    jogar(pagina, 'U', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago do Farol')
    for nome, caminho in [
        ('O fragmento das duas margens', 'RRXRRXRRRRRDURRRXRRRD'),
        ('As duas luzes do farol', 'RDUDDRRXRUURRRRRLRXRRXRXRRR'),
    ]:
        jogar(pagina, 'R', toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#nome-fase')).to_have_text(nome)
        expect(pagina.locator('#trocar-siri')).to_be_visible()
        jogar(pagina, caminho, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        expect(pagina.locator('#erros')).to_have_text('0 / 3')
        tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('2/2')
    jogar(pagina, 'D', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')


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
    conferir_lote2(desktop)
    conferir_grutas(desktop)
    conferir_farol(desktop)
    conferir_enseadinha(navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=(PRIMEIRA_PAGINA == OFFLINE)))
    conferir_recifes_ampliados(desktop)
    conferir_mangue_ampliado(desktop)
    conferir_enseada_ampliada(desktop)
    conferir_deriva_ampliada(desktop)
    conferir_grutas_ampliadas(desktop)
    print(f'{motor}: desktop com Praia, Recifes → Mangue, reload, atalhos, troca e enseada futura.')
    for largura in [320, 390]:
        aparelho = navegador.new_page(viewport={'width': largura, 'height': 844}, has_touch=True,
                                     is_mobile=True, device_scale_factor=2, offline=(PRIMEIRA_PAGINA == OFFLINE))
        conferir_jogo(aparelho, toque=True)
        conferir_praia(aparelho, toque=True, opcional=False)
        conferir_lote(aparelho, toque=True, recifes_primeiro=False)
        conferir_lote2(aparelho, toque=True)
        conferir_grutas(aparelho, toque=True)
        conferir_farol(aparelho, toque=True)
        conferir_enseadinha(aparelho, toque=True)
        conferir_recifes_ampliados(aparelho, toque=True)
        conferir_mangue_ampliado(aparelho, toque=True)
        conferir_enseada_ampliada(aparelho, toque=True)
        conferir_deriva_ampliada(aparelho, toque=True)
        conferir_grutas_ampliadas(aparelho, toque=True)
        print(f'{motor}: toque emulado {largura} × 844 na ordem Mangue → Recifes, reload e encaixe integral.')
    navegador.close()
