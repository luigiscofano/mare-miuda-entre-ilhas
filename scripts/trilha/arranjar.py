"""Sete variações da Praia aprovada. Mesma melodia, andamento e corte."""
import json
import subprocess
from pathlib import Path
import wave
import numpy as np

from sintetizar import FS, nota, wav

D = Path(__file__).resolve().parent
DESTINO = D.parents[1] / "assets/audio/trilha"
K=np.float64(3.9021540350872677)*.8
# Nome, ganho (tema/baixo/apoio), timbre do tema e notas do apoio
# que mudam de oitava sem alterar o andamento.
MUNDOS={
'praia':('Praia das Conchas',(1.,1.,1.),'original',()),
'recifes':('Recifes Expostos',(1.01,.91,1.04),'vidro',(1,3,8,13,19,23,33)),
'mangue':('Mangue dos Siris Duplos',(.98,1.13,.98),'madeira',(2,6,17,21)),
'enseada':('Enseada da Garça',(1.00,.88,.86),'palheta',(5,11,17,25,31,39)),
'deriva':('Ilhas à Deriva',(1.00,1.01,.95),'aco',(3,12,19,22,34)),
'grutas':('Grutas da Espuma',(.99,1.09,.91),'sino',(6,14,21,28,34,37)),
'ressaca':('Baía da Ressaca',(1.01,1.17,.85),'corda',(2,7,16,20,37)),
'farol':('Arquipélago do Farol',(1.00,.88,1.04),'celesta',(2,9,15,21,29,35)),
}

# Coeficientes de um instrumento linear: ataque, amortecimento da nota
# principal e ressonâncias secundárias (relação, amplitude, amortecimento).
# São sons novos em torno da mesma altura, não camadas novas no arranjo.
TIMBRES={
    'vidro':(.007,4.35,((2.,.40,8.8),(3.07,.13,15),(5.02,.046,23))),
    'madeira':(.010,5.15,((2.,.11,9.5),(3.98,.14,17),(6.54,.036,32))),
    'palheta':(.028,3.35,((2.,.10,7.0),(3.,.34,6.2),(4.99,.065,12))),
    'aco':(.012,3.85,((2.,.34,7.4),(2.988,.11,8.2),(4.,.073,15.8))),
    'sino':(.013,3.5,((2.,.075,7.8),(2.76,.19,13),(4.02,.054,18))),
    'corda':(.009,3.7,((2.,.41,9.6),(3.,.22,13.0),(4.,.040,22))),
    'celesta':(.011,4.1,((2.,.47,7.2),(3.0,.08,12),(4.18,.041,25))),
}


def desenhar_nota(n,i,cor):
    if n['voz']!='tema':
        return nota(n,i)
    t=np.arange(round(n['duracao']*FS))/FS
    w=np.pi*440*2**((n['midi']-69)/12)
    ataque,queda,parciais=TIMBRES[cor]
    s=np.sin(w*t)*np.exp(-t*queda)
    for razao,volume,amortecer in parciais:
        s+=volume*np.sin(w*t*razao+.105)*np.exp(-t*amortecer)*(1-np.exp(-t/.009))
    sinal=.19*n['forca']*s*(1-np.exp(-t/ataque))
    cauda=np.clip((t[-1]-t)/.066,0,1)
    return sinal*(.5-.5*np.cos(np.pi*cauda))


def renderizar(score,mundo,j):
    _,ganhos,cor,inversoes=MUNDOS[mundo]
    pcm=np.zeros((j*3+FS,2))
    apoio_n=0
    for i,original in enumerate(score['notas']):
        n=dict(original)
        voz=n['voz']
        if voz=='escova':
            continue
        if voz=='apoio':
            if apoio_n in inversoes:
                n['midi']+=-12 if mundo=='grutas' and n['midi']>=55 else 12 if mundo!='grutas' and n['midi']<64 else 0
                n['forca']*=.82
            elif mundo in ('recifes','farol') and apoio_n%6 in (1,4):
                n['inicio']+=.058 if mundo=='recifes' else .036
            movimentos={'mangue':(.018,1.21),'enseada':(.082,.72),'deriva':(.101,1.15),
                        'grutas':(.076,.84),'ressaca':(-.052,1.21)}
            if mundo in movimentos and apoio_n%5 in (2,4):
                atraso,acento=movimentos[mundo]
                n['inicio']+=atraso
                n['forca']*=acento
            apoio_n+=1
        if voz=='baixo' and mundo=='ressaca' and i%4 in (1,2):
            n['forca']*=1.052
        s=desenhar_nota(n,i,cor)*ganhos[('tema','baixo','apoio').index(voz)]
        if voz=='apoio':
            s*=.81
        pan={'tema':.075,'baixo':0,'apoio':-.21}[voz]
        stereo=s[:,None]*np.sqrt([(1-pan)/2,(1+pan)/2])
        a=round(n['inicio']*FS)
        for ciclo in range(3):
            t=a+j*ciclo
            pcm[t:t+len(s)]+=stereo
    assert np.array_equal(pcm[j:j+1200],pcm[j*2:j*2+1200])
    return pcm[j:2*j]*K


def codificar(origem,destino):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(origem),
                    '-c:a','libmp3lame','-b:a','96k',str(destino)],check=True)


def ler_wav(arquivo):
    with wave.open(str(arquivo),'rb') as f:
        assert f.getframerate()==FS and f.getnchannels()==2
        return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2)/32767.0


def main():
    score=json.loads((D/'siri-na-areia.json').read_text())
    j=round(score['periodo']*FS)
    DESTINO.mkdir(parents=True, exist_ok=True)
    (D / 'masters').mkdir(exist_ok=True)
    for mundo in MUNDOS:
        if mundo == 'praia':
            fonte = D / 'Siri-na-Areia-notas-claras-ciclo.wav'
        else:
            fonte = D / 'masters' / f'{mundo}.wav'
            wav(f'masters/{mundo}.wav', renderizar(score, mundo, j))
        audio = ler_wav(fonte)
        assert audio.shape == (j, 2) and np.abs(audio).max() < 0.7
        arquivo = DESTINO / f'{mundo}.mp3'
        codificar(fonte, arquivo)
        pcm = subprocess.check_output([
            'ffmpeg', '-v', 'error', '-i', str(arquivo), '-f', 's16le', '-',
        ])
        assert len(pcm) == j * 4, (mundo, len(pcm))
        print(mundo, j, round(20 * np.log10(np.abs(audio).max()), 2), flush=True)


if __name__ == '__main__':
    main()
