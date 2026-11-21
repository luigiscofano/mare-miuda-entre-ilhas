"""Marimba arredondada, baixaria macia e uma escova discreta, sem samples."""
import json
from pathlib import Path
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

FS=48000
D=Path(__file__).resolve().parent


def nota(n,i):
    t=np.arange(round(n['duracao']*FS))/FS
    f=440*2**((n['midi']-69)/12)
    v=n['forca']
    w=2*np.pi*f
    rng=np.random.default_rng(61563+i*223)
    voz=n['voz']
    if voz=='tema':
        w *= .5
        # Uma fundamental curta acompanhada de ressonâncias amadeiradas,
        # sem ondas quadradas ou ataques de ruído agudo.
        # O corpo continua na fundamental; a oitava leve agora cresce
        # logo após o toque, deixando o contorno da nota definido sem clique.
        s=(np.sin(w*t)*np.exp(-t*4.1)
           + .242*np.sin(w*t*2+.08)*np.exp(-t*7.4)*(1-np.exp(-t/.012))
           + .049*np.sin(w*t*3.99+.19)*np.exp(-t*18.1)*(1-np.exp(-t/.0065)))
        sinal=.198*v*s*(1-np.exp(-t/.0085))
    elif voz=='apoio':
        s=np.sin(w*t)*np.exp(-t*5.9)+.095*np.sin(w*t*2)*np.exp(-t*11.5)
        sinal=.109*v*s*(1-np.exp(-t/.017))
    elif voz=='baixo':
        s=np.sin(w*t)+.21*np.sin(2*w*t+.16)*np.exp(-t*5.0)+.037*np.sin(3*w*t+.13)*np.exp(-t*7.3)
        sinal=.206*v*s*np.exp(-t*4.4)*(1-np.exp(-t/.019))
    else:
        r=lfilter([.26,0,-.26],[1,-.55,.28],rng.normal(0,1,len(t)))
        sinal=.050*v*r*np.exp(-t/.023)*(1-np.exp(-t/.009))
    cauda=np.clip((t[-1]-t)/(.066 if voz=='tema' else .076),0,1)
    return sinal*(.5-.5*np.cos(np.pi*cauda))


def wav(nome,x):
    assert np.max(np.abs(x))<1
    with wave.open(str(D/nome),'wb') as f:
        f.setparams((2,2,FS,0,'NONE','not compressed'))
        f.writeframes(np.rint(x*32767).astype('<i2').tobytes())


def main():
    score=json.loads((D/'siri-na-areia.json').read_text())
    j=round(score['periodo']*FS)
    pcm=np.zeros((j*3+FS,2))
    bateria=np.zeros_like(pcm)
    apoio=np.zeros_like(pcm)
    for i,n in enumerate(score['notas']):
        s=nota(n,i)
        pan={'tema':.075,'baixo':0,'apoio':-.21,'escova':.28}[n['voz']]
        stereo=s[:,None]*np.sqrt([(1-pan)/2,(1+pan)/2])
        a=round(n['inicio']*FS)
        for ciclo in range(3):
            t=a+j*ciclo
            pcm[t:t+len(s)]+=stereo
            if n['voz']=='escova':
                bateria[t:t+len(s)]+=stereo
            if n['voz']=='apoio':
                apoio[t:t+len(s)]+=stereo
    seca=pcm.copy()
    escova_seca=bateria.copy()
    apoio_seco=apoio.copy()
    for atraso,forca in ():
        i=round(atraso*FS)
        pcm[i:]+=seca[:-i,::-1]*forca
        bateria[i:]+=escova_seca[:-i,::-1]*forca
        apoio[i:]+=apoio_seco[:-i,::-1]*forca
    assert np.array_equal(pcm[j:j+1200],pcm[2*j:2*j+1200])
    k=np.float64(3.9021540350872677)  # Mesmo ganho absoluto da prévia de 100 BPM.
    pcm-=bateria  # Mantém o ganho da versão sem bateria.
    pcm-=.19*apoio  # Só o acompanhamento harmônico recua (-1,83 dB).
    assert np.array_equal(pcm[j:j+1200],pcm[2*j:2*j+1200])
    previa=pcm[:j+round(4*FS)].copy()
    k *= .80  # Folga no master; não há limitador.
    previa*=k
    previa[-round(.31*FS):]*=np.linspace(1,0,round(.31*FS))[:,None]
    wav('Siri-na-Areia-notas-claras-previa.wav',previa)
    wav('Siri-na-Areia-notas-claras-ciclo.wav',pcm[j:2*j]*k)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(D/'Siri-na-Areia-notas-claras-previa.wav'),
                    '-c:a','libmp3lame','-b:a','160k',str(D/'Siri-na-Areia-notas-claras-previa.mp3')],check=True)
    print(f'{len(previa)/FS:.2f}s estéreo, {j/FS:.2f}s ciclo, {len(score["notas"])} eventos, emenda conferida')


if __name__=='__main__':
    main()
