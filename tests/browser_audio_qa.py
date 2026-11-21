"""Cobertura Web Audio no navegador, sem depender do volume físico do host."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

DIST = Path(__file__).resolve().parents[1] / 'dist'
OFFLINE = (DIST / 'mare-miuda-prototipo.html').as_uri()
MUNDOS = ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol']
PERIODO = 1425155 / 48000
SONDA = """(() => {
    window.iniciosDeLoop = [];
    window.paradasDeLoop = [];
    const { start, stop } = AudioBufferSourceNode.prototype;
    AudioBufferSourceNode.prototype.start = function (...args) {
        const resultado = start.apply(this, args);
        if (this.loop) iniciosDeLoop.push({
            instante: args[0], fase: args[1], duracao: this.buffer.duration,
        });
        return resultado;
    };
    AudioBufferSourceNode.prototype.stop = function (...args) {
        const resultado = stop.apply(this, args);
        if (this.loop) paradasDeLoop.push(args[0]);
        return resultado;
    };
})()"""


def acionar(pagina, seletor, toque):
    controle = pagina.locator(seletor)
    controle.tap() if toque else controle.click()


def avancar_mapa(pagina, toque):
    # AtualizarPraia substitui o rótulo acessível com o destino de cada saída.
    acionar(pagina, '[data-mapa-direcao="direita"]', toque)
    expect(pagina.locator('#praia')).to_have_attribute('aria-busy', 'false')


def conferir_embutidas(pagina):
    # Decodifica os oito arquivos reais no motor nativo do Chromium.
    for taxa in (44100, 48000):
        amostras = pagina.evaluate("""async ({mundos, taxa}) => {
            const ctx = new OfflineAudioContext(2, 1, taxa);
            const tamanhos = [];
            for (const mundo of mundos) {
                const dados = document.querySelector('#trilha-offline-' + mundo).textContent;
                const bytes = Uint8Array.from(atob(dados), c => c.charCodeAt(0)).buffer;
                const audio = await ctx.decodeAudioData(bytes);
                tamanhos.push(audio.length);
                if (audio.numberOfChannels !== 2) throw Error('Trilha não estéreo: ' + mundo);
            }
            return tamanhos;
        }""", {'mundos': MUNDOS, 'taxa': taxa})
        esperado = round(PERIODO * taxa)
        assert len(set(amostras)) == 1 and abs(amostras[0] - esperado) <= 2, (taxa, amostras)
        print(f'Chromium offline: oito faixas estéreo, {amostras[0]} amostras a {taxa} Hz')


def conferir_travessia_da_praia(pagina, toque):
    acionar(pagina, '[data-marco="primeira-onda"]', toque)
    expect(pagina.locator('#nome-fase')).to_have_text('Passagem da primeira onda')
    acionar(pagina, '[data-direcao="direita"]', toque)
    expect(pagina.locator('#passos')).to_have_text('1')
    acionar(pagina, '#voltar-fase', toque)
    assert pagina.evaluate('iniciosDeLoop.length') == 1
    assert pagina.evaluate('paradasDeLoop.length') == 0
    assert abs(pagina.evaluate('iniciosDeLoop[0].fase')) < 1e-6


def testar_offline(browser):
    with browser.new_context(offline=True) as contexto:
        pagina = contexto.new_page()
        erros, externos = [], []
        pagina.on('pageerror', lambda erro: erros.append(str(erro)))
        pagina.on('request', lambda req: externos.append(req.url) if req.url.startswith('http') else None)
        pagina.add_init_script(SONDA)
        pagina.goto(OFFLINE)
        assert pagina.evaluate('iniciosDeLoop.length') == 0
        expect(pagina.locator('#comecar')).to_have_text('Começar viagem')
        acionar(pagina, '#comecar', False)
        pagina.wait_for_function('iniciosDeLoop.length === 1')
        conferir_travessia_da_praia(pagina, False)
        conferir_embutidas(pagina)
        assert not externos and not erros, (externos, erros)


def testar_rede(browser, url, *, toque=False):
    # Um contexto falha a primeira solicitação para testar recuperação.
    # Outro começa com save descartável e cruza de fato Praia → Mangue.
    with browser.new_context(has_touch=toque) as contexto:
        pagina = contexto.new_page()
        pedidos = []
        pagina.add_init_script(SONDA)

        def responder(rota):
            pedidos.append(rota.request.url.rsplit('/', 1)[-1])
            rota.fulfill(status=404) if len(pedidos) == 1 else rota.continue_()

        pagina.route('**/assets/audio/trilha/*.mp3', responder)
        pagina.goto(url)
        assert not pedidos
        with pagina.expect_response(lambda r: r.url.endswith('/praia.mp3') and r.status == 404):
            acionar(pagina, '#comecar', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Praia das Conchas')
        acionar(pagina, '[data-marco="primeira-onda"]', toque)
        expect(pagina.locator('#nome-fase')).to_have_text('Passagem da primeira onda')
        pagina.wait_for_function('iniciosDeLoop.length === 1')
        assert pedidos == ['praia.mp3', 'praia.mp3'], pedidos

    with browser.new_context(has_touch=toque) as contexto:
        pagina = contexto.new_page()
        pedidos, erros = [], []
        pagina.on('pageerror', lambda erro: erros.append(str(erro)))
        pagina.on('request', lambda req: pedidos.append(req.url.rsplit('/', 1)[-1]) if req.url.endswith('.mp3') else None)
        pagina.add_init_script(SONDA)
        pagina.goto(url)
        pagina.evaluate("""() => localStorage.setItem('mare-miuda-entre-ilhas/praia-v1', JSON.stringify({
            versao: 1, progresso: {mundo: 'praia', posicao: {coluna: 7, linha: 1}, viuTutorial: true,
                concluidas: ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca']},
            audio: {musica: 0.35, efeitos: 0},
        }))""")
        pagina.reload()
        expect(pagina.locator('#comecar')).to_have_text('Continuar viagem')
        acionar(pagina, '#comecar', toque)
        pagina.wait_for_function('iniciosDeLoop.length === 1')
        acionar(pagina, '[data-marco="embarque-cabo"]', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Arquipélago')
        for _ in range(2):
            avancar_mapa(pagina, toque)
        assert pedidos == ['praia.mp3'], pedidos
        assert pagina.evaluate('iniciosDeLoop.length') == 1
        acionar(pagina, '#entrar-fase', toque)
        expect(pagina.locator('#titulo-praia')).to_have_text('Mangue dos Siris Duplos')
        pagina.wait_for_function('iniciosDeLoop.length === 2')
        primeiro, segundo = pagina.evaluate('iniciosDeLoop')
        diferenca = segundo['instante'] - primeiro['instante']
        assert diferenca > 0
        assert abs(segundo['fase'] - diferenca % segundo['duracao']) < 0.002
        assert abs(segundo['duracao'] - primeiro['duracao']) < 0.002
        # O relógio exato do MP3 no WebKit pode incluir padding do codec;
        # nativamente, o ponto relevante aqui é a continuidade entre os dois loops.
        assert abs(segundo['duracao'] - PERIODO) < 0.1
        [parada] = pagina.evaluate('paradasDeLoop')
        assert abs(parada - segundo['instante'] - 0.44) < 0.002
        acionar(pagina, '[data-marco="mangue-dois-encontros"]', toque)
        expect(pagina.locator('#nome-fase')).to_have_text('Raízes vizinhas')
        acionar(pagina, '#voltar-fase', toque)
        assert pagina.evaluate('iniciosDeLoop.length') == 2
        assert pedidos == ['praia.mp3', 'mangue.mp3'] and not erros, (pedidos, erros)
        print(f'{browser.browser_type.name} servido: recuperação após 404, Praia → Mangue em fase e crossfade de 440 ms')


class ServirDist(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


@contextmanager
def servidor_dist():
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(ServirDist, directory=DIST)) as servidor:
        thread = Thread(target=servidor.serve_forever, daemon=True)
        thread.start()
        try:
            yield f'http://127.0.0.1:{servidor.server_port}/'
        finally:
            servidor.shutdown()
            thread.join()


def conferir_audio_no_ci(browser, motor, url=None):
    if motor == 'chromium':
        testar_offline(browser)
    if url:
        testar_rede(browser, url, toque=(motor == 'webkit'))
    else:
        with servidor_dist() as local:
            testar_rede(browser, local, toque=(motor == 'webkit'))


if __name__ == '__main__':
    with sync_playwright() as playwright:
        motor = os.getenv('MARE_BROWSER', 'chromium')
        caminho = os.getenv('CHROMIUM_PATH') if motor == 'chromium' else None
        with getattr(playwright, motor).launch(executable_path=caminho) as navegador:
            conferir_audio_no_ci(navegador, motor, os.getenv('MARE_QA_URL'))
