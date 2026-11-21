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
    expect(pagina.locator('#garca-patrulha')).to_be_hidden()
    expect(pagina.locator('#garca-rasante')).to_be_hidden()
    expect(pagina.locator('#sinal-concha')).to_be_visible()
    jogar(pagina, 'L', toque)
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#mare')).to_have_text('Alta')
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#passos')).to_have_text('3')
    pagina.locator('[data-fase="2"]').tap() if toque else pagina.locator('[data-fase="2"]').click()
    expect(pagina.locator('#garca-patrulha')).to_be_visible()
    expect(pagina.locator('#garca-rasante')).to_be_hidden()
    expect(pagina.locator('#garca-patrulha')).to_have_js_property('naturalWidth', 31)
    salvar_captura(pagina, f"fauna-patrulha-{pagina.viewport_size['width']}px")
    jogar(pagina, 'RR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Garça no próximo passo')
    expect(pagina.locator('#garca-patrulha')).to_be_hidden()
    expect(pagina.locator('#garca-rasante')).to_be_visible()
    expect(pagina.locator('#garca-rasante')).to_have_js_property('naturalHeight', 23)
    salvar_captura(pagina, f"fauna-rasante-{pagina.viewport_size['width']}px")
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


def conferir_chefes_recifes(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'recifes', posicao: {coluna: 6, linha: 1},
            viuTutorial: true, concluidas: ['recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Guardião das Poças · chefe opcional')
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#mensagem-praia')).to_contain_text('Vença o Guardião das Poças')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#progresso-recife')).to_have_text('Refúgios visitados na alta: 0/2.')
    jogar(pagina, 'RRDR', toque)
    expect(pagina.locator('#progresso-recife')).to_have_text('Refúgios visitados na alta: 1/2.')
    salvar_captura(pagina, f"recifes-guardiao-pocas-{pagina.viewport_size['width']}px")
    jogar(pagina, 'UDURRRLRRRRDURR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Guardião das Poças')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia do Recife · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#progresso-recife')).to_contain_text('Ida aberta ao norte')
    jogar(pagina, 'DUDURRRRRRLRRRR', toque)
    expect(pagina.locator('#progresso-recife')).to_contain_text('Volta aberta ao sul')
    expect(pagina.locator('#feedback')).to_contain_text('A comporta norte fechou')
    salvar_captura(pagina, f"recifes-vigia-comportas-{pagina.viewport_size['width']}px")
    jogar(pagina, 'DDLLLLDUDULLLUUL', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Vigia do Recife')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia do Recife · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    jogar(pagina, 'UL', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('A volta do recife')
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


def conferir_chefes_mangue(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'mangue', posicao: {coluna: 6, linha: 1},
            viuTutorial: true, concluidas: ['mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Guardião da Raiz · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 1 (fechada)')
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 2 (fechada)')
    jogar(pagina, 'XRRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 1 (aberta)')
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 2 (fechada)')
    salvar_captura(pagina, f"mangue-guardiao-raiz-{pagina.viewport_size['width']}px")
    jogar(pagina, 'XRLRRRRRRRXRRXRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 1 (fechada)')
    expect(pagina.locator('#previsao')).to_contain_text('Raiz 2 (aberta)')
    jogar(pagina, 'XRRXRRRXRRLRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#passos')).to_have_text('28')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Dupla no Mangue · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'XRRRRRRRXRRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Garça no próximo passo: coluna 8, linha 4')
    salvar_captura(pagina, f"mangue-dupla-aviso-{pagina.viewport_size['width']}px")
    jogar(pagina, 'L', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A garça te alcançou!')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'XRRRXRRRRRRXRRRRXRRXRDURRRRXRDURRDUDURRXR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#passos')).to_have_text('34')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Dupla no Mangue · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    jogar(pagina, 'UL', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Reencontro na ponta do mangue')
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


def conferir_chefes_enseada(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'enseada', posicao: {coluna: 6, linha: 1},
            viuTutorial: true, concluidas: ['enseada-sombra-restinga', 'enseada-abrigo-ondas',
              'enseada-farol-baixo']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Garça da Restinga · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRRRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Rasante no próximo passo')
    expect(pagina.locator('#previsao')).to_contain_text('coluna 5, linha 2; coluna 6, linha 2')
    expect(pagina.locator('#previsao')).not_to_contain_text('coluna 8, linha 2')
    expect(pagina.locator('#garca-rasante')).to_be_visible()
    salvar_captura(pagina, f"enseada-garca-restinga-{pagina.viewport_size['width']}px")
    jogar(pagina, 'D', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A garça alcançou um siri no rasante')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RLRLRRRRRDRRDRRRRR', toque)
    expect(pagina.locator('#passos')).to_have_text('18')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    expect(pagina.locator('#feedback')).to_contain_text('Arena concluída: Garça da Restinga')
    tocar(pagina, '#voltar-fase', toque)

    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia das Falésias · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRRRXDURRR', toque)
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    expect(pagina.locator('#previsao')).to_contain_text('coluna 5, linha 1; coluna 5, linha 2')
    salvar_captura(pagina, f"enseada-vigia-falesias-{pagina.viewport_size['width']}px")
    jogar(pagina, 'L', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A garça alcançou um siri no rasante')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'UDRXRRRRRRXRRRRRRRRRXRRRR', toque)
    expect(pagina.locator('#passos')).to_have_text('22')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    expect(pagina.locator('#feedback')).to_contain_text('Arena concluída: Vigia das Falésias')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia das Falésias · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    jogar(pagina, 'UL', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Corrida ao farol baixo')
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


def conferir_chefes_deriva(pagina, toque=False):
    # Só as três fases históricas: as arenas não exigem o ramo norte.
    pagina.evaluate("""localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
      versao: 1,
      progresso: { mundo: 'deriva', posicao: {coluna: 6, linha: 1}, viuTutorial: true,
        concluidas: ['deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada'] },
      audio: { musica: 0, efeitos: 0 }
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Mestre das Correntes · chefe opcional')
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Mestre das Correntes')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 0/2')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Firme os dois ancoradouros')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'DD', toque)
    expect(pagina.locator('#feedback')).to_contain_text('faltar um passo para a virada')
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 0/2')
    jogar(pagina, 'RDUDRUUULR', toque)
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 1/2')
    expect(pagina.locator('#grade')).to_contain_text('SC~~~n')
    salvar_captura(pagina, f"deriva-atracacao-{pagina.viewport_size['width']}px")
    jogar(pagina, 'DDDLLLLUL', toque)
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 2/2')
    jogar(pagina, 'UUR', toque)
    expect(pagina.locator('#passos')).to_have_text('24')
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Mestre das Correntes.')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Passagem das Balsas · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Portão 1 (fechado)')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')

    primeira = 'DUDURRRRXR'
    jogar(pagina, primeira, toque)
    expect(pagina.locator('#passos')).to_have_text('9')
    expect(pagina.locator('#posicao')).to_contain_text('Coral: coluna 6, linha 1')
    expect(pagina.locator('#posicao')).to_contain_text('Verde (ativo): coluna 3, linha 4')
    jogar(pagina, 'RXRRXR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Portão 2 (aberto)')
    jogar(pagina, 'RXR', toque)
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    expect(pagina.locator('#feedback')).to_contain_text('A maré te levou')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, primeira + 'RXRRXRRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Portão 1 (aberto)')
    salvar_captura(pagina, f"deriva-passagem-{pagina.viewport_size['width']}px")
    jogar(pagina, 'XRRXRRRRXRRRR', toque)
    expect(pagina.locator('#passos')).to_have_text('25')
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Passagem das Balsas.')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Passagem das Balsas · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('3/10')
    jogar(pagina, 'U', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Mestre das Correntes · chefe opcional · concluída')


def conferir_chefes_grutas(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'grutas', posicao: {coluna: 10, linha: 1},
            viuTutorial: true, concluidas: ['grutas-encaixe', 'grutas-ordem',
                'grutas-retorno', 'grutas-dupla-portao', 'grutas-dupla-camaras']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Sentinela da Gruta · chefe opcional')
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Sentinela da Gruta')
    tocar(pagina, '#entrar-fase', toque)
    jogar(pagina, 'RRRDRRU', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A peça exige: maré alta.')
    expect(pagina.locator('#fragmento')).to_contain_text('Próxima etapa: Encaixe A')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RRRDUDUDRRU', toque)
    expect(pagina.locator('#fragmento')).to_contain_text('Alavanca B · maré baixa (abre no próximo passo)')
    salvar_captura(pagina, f"grutas-sentinela-{pagina.viewport_size['width']}px")
    jogar(pagina, 'DDDDLLLRRRRRR', toque)
    expect(pagina.locator('#passos')).to_have_text('24')
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Sentinela da Gruta.')
    tocar(pagina, '#voltar-fase', toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Cofre das Espumas · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    jogar(pagina, 'RRXDRRURRDURRRRRXRRRXDUR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('O outro siri precisa estar na placa')
    expect(pagina.locator('#fragmento')).to_contain_text('Placa livre')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RRXDRRURRDURRRRRXRRRRRRR', toque)
    expect(pagina.locator('#fragmento')).to_contain_text('Placa ocupada')
    salvar_captura(pagina, f"grutas-cofre-{pagina.viewport_size['width']}px")
    jogar(pagina, 'XRRXRRR', toque)
    expect(pagina.locator('#passos')).to_have_text('27')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Cofre das Espumas.')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Cofre das Espumas · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('5/10')


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



def conferir_trio_grutas(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    # Usa um save de jogador que já aprendeu a placa em dupla.
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'grutas', posicao: {coluna: 8, linha: 1},
            viuTutorial: true, concluidas: ['grutas-encaixe', 'grutas-ordem',
              'grutas-retorno', 'grutas-dupla-portao']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Três refúgios · opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Coral, círculo')
    expect(pagina.locator('#folha-fauna')).to_have_js_property('naturalWidth', 155)
    assert pagina.locator('#tabuleiro').evaluate("""canvas => {
        const imagem = document.querySelector('#folha-fauna');
        const folha = document.createElement('canvas');
        folha.width = 155;
        folha.height = 23;
        const fonte = folha.getContext('2d');
        fonte.drawImage(imagem, 0, 0);
        const tabuleiro = canvas.getContext('2d');
        const branco = [255, 245, 220];
        return [0, 2, 4].every((linha, i) => {
            // Os três começam na primeira coluna do tabuleiro de 8 × 5.
            const y = 112 + linha * 32;
            const esperado = fonte.getImageData(i * 31, 0, 31, 23).data;
            const desenhado = tabuleiro.getImageData(129, y + 3, 31, 23).data;
            const marca = tabuleiro.getImageData(143, y + 1, 3, 3).data;
            const contornos = ['010101010', '111101111', '010101111'];
            return esperado.every((canal, n) => esperado[(n & ~3) + 3] === 0 || canal === desenhado[n])
              && [...contornos[i]].every((bit, p) =>
                branco.every((canal, j) => (marca[p * 4 + j] === canal) === (bit === '1')));
        });
    }"""), 'Os pixels opacos do trio e as três insígnias precisam coincidir.'
    salvar_captura(pagina, f"fauna-trio-{pagina.viewport_size['width']}px")
    for siri, insignia in [('Verde', 'quadrado'), ('Amarelo', 'triângulo'), ('Coral', 'círculo')]:
        jogar(pagina, 'X', toque)
        expect(pagina.locator('#dupla-ativa')).to_contain_text(f'{siri}, {insignia}')
        expect(pagina.locator('#posicao')).to_contain_text(f'{siri} (ativo)')
        expect(pagina.locator('#feedback')).to_contain_text(f'Siri ativo: {siri}. A maré não avançou.')
        expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'RRRXRRRRRRXRRRR', toque)
    expect(pagina.locator('#posicao')).to_contain_text('Amarelo (ativo): coluna 5, linha 5')
    expect(pagina.locator('#posicao')).to_contain_text('Verde: coluna 7, linha 3')
    salvar_captura(pagina, f"grutas-tres-refugios-{pagina.viewport_size['width']}px")
    jogar(pagina, 'XRRXXRRXRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#passos')).to_have_text('19')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Três refúgios · opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('4/10')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')



def conferir_trio_avancado(pagina, toque=False):
    casos = [
        ('ressaca', (10, -1), 'D', 'U', 'Eco dos três cais', '7/10', [
            'ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', 'ressaca-refugio-de-pedra',
            'ressaca-bolsos-opostos', 'ressaca-vigia-da-placa', 'ressaca-balsas-da-ponta',
            'ressaca-cais-em-paralelo',
        ]),
        ('farol', (11, 3), 'L', 'R', 'Três luzes em revezamento', '6/10', [
            'farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
            'farol-turno-dos-guardioes', 'farol-salao-das-lanternas', 'farol-luz-das-duas-mares',
        ]),
    ]
    for mundo, marco, ida, volta, nome, contagem, concluidas in casos:
        pagina.goto(PRIMEIRA_PAGINA)
        registro = {
            'versao': 1, 'progresso': {'mundo': mundo, 'posicao': {'coluna': marco[0], 'linha': marco[1]},
                'viuTutorial': True, 'concluidas': concluidas}, 'audio': {'musica': 0, 'efeitos': 0},
        }
        pagina.evaluate(
            "registro => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify(registro))",
            registro,
        )
        pagina.reload()
        tocar(pagina, '#comecar', toque)
        jogar(pagina, ida, toque, mapa=True)
        expect(pagina.locator('#posicao-praia')).to_contain_text(f'{nome} · opcional')
        tocar(pagina, '#entrar-fase', toque)
        if mundo == 'ressaca':
            jogar(pagina, 'RXXRR', toque)
            expect(pagina.locator('#feedback')).to_contain_text('A balsa levou o siri ao outro cais.')
            jogar(pagina, 'RRRXRXRR', toque)
            expect(pagina.locator('#posicao')).to_contain_text('Coral: coluna 6, linha 1')
            expect(pagina.locator('#posicao')).to_contain_text('Verde (ativo)')
            salvar_captura(pagina, f"ressaca-trio-{pagina.viewport_size['width']}px")
            jogar(pagina, 'XRXRXRRRRRRXXRRRRXRR', toque)
            expect(pagina.locator('#passos')).to_have_text('23')
        else:
            jogar(pagina, 'XRRRXRRXRRRXXRRXXR', toque)
            expect(pagina.locator('#fragmento')).to_contain_text('Pérola com o siri verde')
            jogar(pagina, 'RRXRRRLRXRRRRRXRRRR', toque)
            expect(pagina.locator('#fragmento')).to_contain_text('Próxima etapa: Alavanca B')
            expect(pagina.locator('#posicao')).to_contain_text('Amarelo: coluna 9, linha 5')
            jogar(pagina, 'XXR', toque)
            expect(pagina.locator('#fragmento')).to_contain_text('Portão aberto')
            salvar_captura(pagina, f"farol-trio-{pagina.viewport_size['width']}px")
            jogar(pagina, 'XRRXRRRRRXRRRRR', toque)
            expect(pagina.locator('#passos')).to_have_text('40')
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        expect(pagina.locator('#erros')).to_have_text('0 / 3')
        assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
        tocar(pagina, '#voltar-fase', toque)
        pagina.reload()
        tocar(pagina, '#comecar', toque)
        expect(pagina.locator('#posicao-praia')).to_contain_text(f'{nome} · opcional · concluída')
        expect(pagina.locator('#progresso-praia')).to_contain_text(contagem)
        jogar(pagina, volta, toque, mapa=True)
        expect(pagina.locator('#posicao-praia')).to_contain_text(
            'Cais em paralelo' if mundo == 'ressaca' else 'A luz das duas marés')


def conferir_ressaca_ampliada(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    # Retoma o último marco para verificar a travessia cronometrada na interface.
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'ressaca', posicao: {coluna: 8, linha: 3},
            viuTutorial: true, concluidas: ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros',
              'ressaca-refugio-de-pedra', 'ressaca-bolsos-opostos', 'ressaca-vigia-da-placa',
              'ressaca-balsas-da-ponta', 'ressaca-cais-em-paralelo',
              'ressaca-tres-moedas-do-cais', 'ressaca-atracadouro-torto']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Cofre da vazante')
    expect(pagina.locator('#progresso-praia')).to_contain_text('9/10')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#orcamento')).to_contain_text('Passos restantes: 22')
    expect(pagina.locator('#fragmento')).to_contain_text('Moedas: 0/3')
    jogar(pagina, 'RX', toque)
    expect(pagina.locator('#dupla-ativa')).to_contain_text('Verde')
    expect(pagina.locator('#orcamento')).to_contain_text('Passos restantes: 21')
    jogar(pagina, 'RRRURRXRRRRRXRRRXRRRXU', toque)
    expect(pagina.locator('#fragmento')).to_contain_text('Moedas: 3/3')
    expect(pagina.locator('#orcamento')).to_contain_text('Passos restantes: 3')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    salvar_captura(pagina, f"ressaca-cofre-da-vazante-{pagina.viewport_size['width']}px")
    jogar(pagina, 'DRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    expect(pagina.locator('#orcamento')).to_contain_text('Passos restantes: 0')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Cofre da vazante · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')



def conferir_vento_sul(pagina, toque=False):
    # A verificação anterior deixa o viajante no Cofre concluído.
    jogar(pagina, 'L', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vento Sul · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 0/3')
    expect(pagina.locator('#previsao')).to_contain_text('linha 1, colunas 2 a 4')
    jogar(pagina, 'RR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Em 1 passo')
    salvar_captura(pagina, f"ressaca-vento-sul-aviso-{pagina.viewport_size['width']}px")
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A faixa da ressaca te alcançou!')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 0/3')
    tocar(pagina, '#reiniciar', toque)
    expect(pagina.locator('#passos')).to_have_text('0')
    jogar(pagina, 'DDUURRRLRLRDDRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Volte a este ancoradouro na maré baixa.')
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 2/3')
    jogar(pagina, 'LR', toque)
    expect(pagina.locator('#ancoradouros')).to_have_text('Ancoradouros firmes: 3/3')
    expect(pagina.locator('#grade')).to_contain_text('n=.H=..n')
    jogar(pagina, 'LUURR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Vento Sul vencido.')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vento Sul · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_ressaca_alta(pagina, toque=False):
    # O desafio fica à esquerda do primeiro chefe, sem alterar o mapa antigo.
    jogar(pagina, 'L', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Ressaca Alta · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#ancoradouros')).to_be_hidden()
    expect(pagina.locator('#ondas-seguras')).to_have_text('Ondas seguras seguidas: 0/3')
    expect(pagina.locator('#previsao')).to_contain_text('linha 1, colunas 1 a 13')
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#ondas-seguras')).to_have_text('Ondas seguras seguidas: 1/3')
    expect(pagina.locator('#previsao')).to_contain_text('linha 5, colunas 1 a 13')
    jogar(pagina, 'LRLRLR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A faixa da ressaca te alcançou!')
    expect(pagina.locator('#ondas-seguras')).to_have_text('Ondas seguras seguidas: 0/3')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RDXRRRRXDRDRRXRRRR', toque)
    expect(pagina.locator('#ondas-seguras')).to_have_text('Ondas seguras seguidas: 3/3')
    expect(pagina.locator('#passos')).to_have_text('15')
    salvar_captura(pagina, f"ressaca-alta-refugios-{pagina.viewport_size['width']}px")
    jogar(pagina, 'RXDRRRRXRRRRUUUUXRRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Ressaca Alta vencida.')
    expect(pagina.locator('#passos')).to_have_text('34')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Ressaca Alta · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')



def conferir_vigia_das_ondas(pagina, toque=False):
    jogar(pagina, 'U', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia das ondas · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#ancoradouros')).to_be_hidden()
    expect(pagina.locator('#ondas-seguras')).to_be_hidden()
    expect(pagina.locator('#previsao')).to_contain_text('linha 2, colunas 3 a 9')
    jogar(pagina, 'RR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Em 1 passo a maré sobe')
    salvar_captura(pagina, f"praia-vigia-das-ondas-{pagina.viewport_size['width']}px")
    jogar(pagina, 'D', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A faixa da ressaca te alcançou!')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RLRRDRRDU', toque)
    expect(pagina.locator('#passos')).to_have_text('9')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    jogar(pagina, 'RLRRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Vigia das ondas vencido.')
    expect(pagina.locator('#passos')).to_have_text('16')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia das ondas · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/3')
    conferir_ponta_da_ressaca(pagina, toque)
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Fio de areia')


def conferir_ponta_da_ressaca(pagina, toque=False):
    jogar(pagina, 'U', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Ponta da Ressaca · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#previsao')).to_contain_text('linha 2, colunas 3 a 9')
    jogar(pagina, 'RRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('linha 4, colunas 10 a 13')
    jogar(pagina, 'DDURRRRLRRDRDDU', toque)
    expect(pagina.locator('#passos')).to_have_text('18')
    expect(pagina.locator('#previsao')).to_contain_text('linha 4, colunas 10 a 13')
    expect(pagina.locator('#ancoradouros')).to_be_hidden()
    expect(pagina.locator('#ondas-seguras')).to_be_hidden()
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    salvar_captura(pagina, f"praia-ponta-da-ressaca-{pagina.viewport_size['width']}px")
    jogar(pagina, 'RRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Ponta da Ressaca vencido.')
    expect(pagina.locator('#passos')).to_have_text('22')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Ponta da Ressaca · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('1/3')
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Vigia das ondas')



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
            conferir_vigia_das_ondas(pagina, toque)
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
    expect(pagina.locator('#progresso-praia')).to_contain_text('2/10')
    jogar(pagina, 'D', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')


def conferir_guardiao_do_farol(pagina, toque=False):
    jogar(pagina, 'D', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Guardião do Farol · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 0/3')
    expect(pagina.locator('#previsao')).to_contain_text('Feixe atual: oeste')
    jogar(pagina, 'DURRR', toque)
    expect(pagina.locator('#previsao')).to_contain_text('Em 1 passo: sul')
    salvar_captura(pagina, f"farol-guardiao-aviso-{pagina.viewport_size['width']}px")
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#feedback')).to_contain_text('A ponte de luz apagou')
    expect(pagina.locator('#erros')).to_have_text('1 / 3')
    jogar(pagina, 'R', toque)
    expect(pagina.locator('#passos')).to_have_text('6')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RRRRRDUDDDDRRRRR', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 1/3')
    jogar(pagina, 'DULLLUULLUURLDUDDRRRRLRRR', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 3/3')
    expect(pagina.locator('#feedback')).to_contain_text('Guardião do Farol vencido.')
    expect(pagina.locator('#passos')).to_have_text('41')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Guardião do Farol · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')
    conferir_ultima_virada(pagina, toque)
    jogar(pagina, 'U', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('A luz das duas marés')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')



def conferir_ultima_virada(pagina, toque=False):
    jogar(pagina, 'L', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Última Virada · chefe opcional')
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 0/3')
    expect(pagina.locator('#previsao')).to_contain_text('Placa em coluna 9, linha 3 (livre)')
    jogar(pagina, 'RXRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Outro siri precisa ocupar a placa indicada')
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 0/3')
    tocar(pagina, '#reiniciar', toque)
    jogar(pagina, 'RRRXXRRRRRRRRRRXRRRRRRXRR', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 1/3')
    expect(pagina.locator('#previsao')).to_contain_text('Placa em coluna 11, linha 5 (ocupada)')
    salvar_captura(pagina, f"farol-ultima-virada-{pagina.viewport_size['width']}px")
    jogar(pagina, 'RRRRRRXXRRRXXLLL', toque)
    expect(pagina.locator('#lentes-farol')).to_have_text('Lentes acesas: 3/3')
    jogar(pagina, 'RRRRRRRXRRXRRRRRR', toque)
    expect(pagina.locator('#feedback')).to_contain_text('Arena vencida: Última Virada.')
    expect(pagina.locator('#passos')).to_have_text('48')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Última Virada · chefe opcional · concluída')
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')
    jogar(pagina, 'R', toque, mapa=True)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Guardião do Farol')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')


def conferir_desfecho(pagina, toque=False):
    pagina.goto(PRIMEIRA_PAGINA)
    pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
        versao: 1, progresso: {mundo: 'farol', posicao: {coluna: 10, linha: 1}, viuTutorial: true,
          concluidas: ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
                       'farol-turno-dos-guardioes', 'farol-salao-das-lanternas']},
        audio: {musica: 0, efeitos: 0},
    }))""")
    pagina.reload()
    tocar(pagina, '#creditos-inicio', toque)
    expect(pagina.locator('#titulo-creditos')).to_have_text('Créditos')
    expect(pagina.locator('#desfecho')).not_to_contain_text('A luz voltou')
    tocar(pagina, '#voltar-creditos', toque)
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#rever-desfecho')).to_be_hidden()
    jogar(pagina, 'D', toque, mapa=True)
    tocar(pagina, '#entrar-fase', toque)
    expect(pagina.locator('#nome-fase')).to_have_text('A luz das duas marés')
    expect(pagina.locator('#seguir-fase')).to_be_hidden()
    jogar(pagina, 'RXRRRXRRRXRRRXRRRRXDDXRRLRLRLDDRLDRRRXRRD', toque)
    expect(pagina.locator('#passos')).to_have_text('34')
    expect(pagina.locator('#erros')).to_have_text('0 / 3')
    expect(pagina.locator('#seguir-fase')).to_have_text('Ver desfecho')
    expect(pagina.locator('#creditos')).to_be_hidden()
    tocar(pagina, '#seguir-fase', toque)
    expect(pagina.locator('#titulo-creditos')).to_have_text('Desfecho e créditos')
    expect(pagina.locator('#titulo-creditos')).to_be_focused()
    expect(pagina.locator('#desfecho')).to_contain_text('A luz voltou')
    expect(pagina.locator('#creditos')).to_contain_text('Luigi Scofano de Araujo')
    tocar(pagina, '#voltar-creditos', toque)
    expect(pagina.locator('#titulo-praia')).to_be_focused()
    expect(pagina.locator('#posicao-praia')).to_contain_text('A luz das duas marés · concluída')
    expect(pagina.locator('#rever-desfecho')).to_be_visible()
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('6/10')
    expect(pagina.locator('#posicao-praia')).to_contain_text('A luz das duas marés · concluída')
    jogar(pagina, 'U', toque, mapa=True)
    tocar(pagina, '#rever-desfecho', toque)
    expect(pagina.locator('#desfecho')).to_contain_text('A luz voltou')
    assert pagina.evaluate('document.documentElement.scrollWidth === window.innerWidth')
    tocar(pagina, '#voltar-creditos', toque)
    expect(pagina.locator('#posicao-praia')).to_contain_text('Salão das lanternas · concluída')
    expect(pagina.locator('#titulo-praia')).to_be_focused()


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
        expect(pagina.locator('#seguir-fase')).to_be_hidden()
        tocar(pagina, '#voltar-fase', toque)
        expect(pagina.locator('#rever-desfecho')).to_be_hidden()
    etapas = [
        ('R', 'Faroleiros de vigia', 'XRXRRRDRXRRRRRDXRRUDD'),
        ('R', 'Turno dos guardiões', 'RRRXRRRRRRXRXRRLXRRRRRXR'),
        ('R', 'Salão das lanternas', 'RRRRRXRRRRRRXRDRRRDRXRDRRRU'),
        ('LLLU', 'Costa das três luzes', 'DLDLRLRLLUUUUURRRDRRURRDDDR'),
        ('R', 'Faísca de entrada', 'RRRURRRDRDLULLLULULRRRDRRDRDDR'),
        ('R', 'Quatro cais do farol', 'RRRRRRDRDRLRRDDDRLLRLLRLLULLLL'),
        ('R', 'Lentes em contramaré', 'RRRXRRRRRXRRRRXRDDXDRRLDDRXRR'),
        ('DD', 'A luz das duas marés', 'RXRRRXRRRXRRRXRRRRXDDXRRLRLRLDDRLDRRRXRRD'),
    ]
    for entrada, nome, caminho in etapas:
        jogar(pagina, entrada, toque, mapa=True)
        tocar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#nome-fase')).to_have_text(nome)
        if nome == 'Costa das três luzes':
            expect(pagina.locator('#orcamento')).to_have_text('Passos restantes: 29')
        jogar(pagina, caminho, toque)
        expect(pagina.locator('#feedback')).to_contain_text('Fase concluída!')
        expect(pagina.locator('#erros')).to_have_text('0 / 3')
        if nome == 'A luz das duas marés':
            expect(pagina.locator('#passos')).to_have_text('34')
            salvar_captura(pagina, f"farol-duas-mares-{pagina.viewport_size['width']}px")
        tocar(pagina, '#voltar-fase', toque)
    pagina.reload()
    tocar(pagina, '#comecar', toque)
    expect(pagina.locator('#progresso-praia')).to_contain_text('10/10')
    expect(pagina.locator('#posicao-praia')).to_contain_text('A luz das duas marés')
    conferir_guardiao_do_farol(pagina, toque)
    jogar(pagina, 'ULLLD', toque, mapa=True)
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
    conferir_desfecho(desktop)
    conferir_enseadinha(navegador.new_page(viewport={'width': 1180, 'height': 820}, offline=(PRIMEIRA_PAGINA == OFFLINE)))
    conferir_recifes_ampliados(desktop)
    conferir_chefes_recifes(desktop)
    conferir_mangue_ampliado(desktop)
    conferir_chefes_mangue(desktop)
    conferir_enseada_ampliada(desktop)
    conferir_chefes_enseada(desktop)
    conferir_deriva_ampliada(desktop)
    conferir_grutas_ampliadas(desktop)
    conferir_chefes_grutas(desktop)
    conferir_trio_grutas(desktop)
    conferir_trio_avancado(desktop)
    conferir_ressaca_ampliada(desktop)
    conferir_vento_sul(desktop)
    conferir_ressaca_alta(desktop)
    conferir_chefes_deriva(desktop)
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
        conferir_desfecho(aparelho, toque=True)
        conferir_enseadinha(aparelho, toque=True)
        conferir_recifes_ampliados(aparelho, toque=True)
        conferir_chefes_recifes(aparelho, toque=True)
        conferir_mangue_ampliado(aparelho, toque=True)
        conferir_chefes_mangue(aparelho, toque=True)
        conferir_enseada_ampliada(aparelho, toque=True)
        conferir_chefes_enseada(aparelho, toque=True)
        conferir_deriva_ampliada(aparelho, toque=True)
        conferir_grutas_ampliadas(aparelho, toque=True)
        conferir_chefes_grutas(aparelho, toque=True)
        conferir_trio_grutas(aparelho, toque=True)
        conferir_trio_avancado(aparelho, toque=True)
        conferir_ressaca_ampliada(aparelho, toque=True)
        conferir_vento_sul(aparelho, toque=True)
        conferir_ressaca_alta(aparelho, toque=True)
        conferir_chefes_deriva(aparelho, toque=True)
        print(f'{motor}: toque emulado {largura} × 844 na ordem Mangue → Recifes, reload e encaixe integral.')
    navegador.close()
