"""Siri na Areia: tema original para a abertura e a exploração."""
import json
from pathlib import Path

PASTA = Path(__file__).resolve().parent
PULSO = 60 / 97
HARMONIA = ((48,52,55),(48,55,57),(43,53,59),(48,52,55),
            (41,53,57),(48,52,55),(45,52,60),(43,53,59),
            (48,52,55),(48,55,57),(43,53,59),(48,52,55))

# Notas em contratempo deixam espaço para os sons da fase.
CANTO = (
 ((.16,72,.65),(.68,76,.67),(1.23,79,.74),(1.96,76,.62),(2.76,74,.65),(3.42,72,.70)),
 ((.37,69,.58),(1.22,72,.70),(1.84,74,.66),(2.59,76,.71),(3.40,79,.61)),
 ((.14,77,.69),(.89,74,.63),(1.62,71,.60),(2.27,74,.65),(3.11,67,.52)),
 ((.16,72,.70),(1.00,76,.66),(1.64,74,.61),(2.62,72,.72)),
 ((.19,72,.61),(.83,77,.68),(1.58,81,.72),(2.20,79,.63),(3.05,77,.62)),
 ((.14,76,.68),(.91,79,.72),(1.53,76,.63),(2.35,72,.60),(3.07,74,.61)),
 ((.28,76,.66),(.90,72,.59),(1.61,69,.62),(2.22,72,.61),(3.12,76,.67)),
 ((.21,74,.64),(.96,77,.65),(1.68,74,.60),(2.30,71,.58),(3.22,67,.50)),
 ((.16,72,.66),(.68,76,.68),(1.23,79,.75),(1.96,76,.61),(2.76,74,.63),(3.42,72,.71)),
 ((.37,69,.58),(1.22,72,.69),(1.84,74,.66),(2.59,76,.72),(3.40,81,.64)),
 ((.16,79,.67),(.89,77,.64),(1.53,74,.59),(2.15,71,.61),(3.07,74,.57)),
 ((.18,76,.68),(.92,74,.62),(1.76,72,.70),(2.63,67,.49),(3.22,72,.54)),
)


def compor():
    eventos=[]
    def juntar(i,p,m,v,voz,d):
        eventos.append({'inicio':round((i*4+p)*PULSO,6),'midi':m,
                        'forca':v,'voz':voz,'duracao':d})
    for i,(raiz,a,b) in enumerate(HARMONIA):
        for j,(p,m,v) in enumerate(CANTO[i]):
            juntar(i,p,m,v,'tema',(.43,.37,.52)[j%3])
        for p,m,v,d in ((.032,raiz,.49,.57),(2.052,raiz+7,.31,.46)):
            juntar(i,p,m,v,'baixo',d)
        for j,p in enumerate((.93,2.59) if i%3!=2 else (1.42,)):
            juntar(i,p,a,.37 if j==0 else .32,'apoio',.38)
            juntar(i,p+.034,b,.28,'apoio',.31)
        if i%4!=3:
            juntar(i,1.49+(i%2)*.018,0,.33,'escova',.079)
        if i%4==1:
            juntar(i,3.09,0,.27,'escova',.074)
    eventos.sort(key=lambda n:n['inicio'])
    return {'nome':'Siri na Areia','periodo':len(HARMONIA)*PULSO*4,'notas':eventos}


if __name__=='__main__':
    (PASTA/'siri-na-areia.json').write_text(json.dumps(compor(),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
