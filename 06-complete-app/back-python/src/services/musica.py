import math

from config import *
from models.musica import Musica

# SERVIÇO = onde fica a "lógica": converter dados, validar e falar com o banco.
# As rotas só recebem o pedido e chamam estas funções.


def _para_inteiro(valor, nome):
    # Converte para inteiro sem "arredondar" escondido:
    # 1975.7 e True NÃO são aceitos (int() aceitaria e truncaria/converteria).
    if isinstance(valor, bool):
        raise ValueError(nome + " deve ser um número inteiro")
    if isinstance(valor, float):
        if not valor.is_integer():
            raise ValueError(nome + " deve ser um número inteiro")
        return int(valor)
    return int(valor)  # texto como "1975" funciona; "abc" levanta ValueError


def criar_musica(data):
    # "data" é o dicionário que veio do frontend (JSON).
    # Se algo for inválido, levantamos ValueError/TypeError
    # (a rota captura esse erro e responde 400).

    # textos obrigatórios: precisam ser texto e não podem ser só espaços
    textos = {}
    for campo in ('titulo', 'artista', 'genero'):
        valor = data[campo]
        if not isinstance(valor, str) or valor.strip() == '':
            raise ValueError(campo + " deve ser um texto não vazio")
        textos[campo] = valor.strip()

    ano = _para_inteiro(data['ano'], 'ano')
    if ano < 0:
        raise ValueError("ano inválido")

    # duração e nota são opcionais: se vierem vazias, guardamos None
    duracao = None
    if data.get('duracao') not in (None, ''):
        duracao = _para_inteiro(data['duracao'], 'duracao')
        if duracao < 0:
            raise ValueError("duracao não pode ser negativa")

    nota = None
    if data.get('nota') not in (None, ''):
        if isinstance(data['nota'], bool):
            raise ValueError("nota inválida")
        nota = float(data['nota'])
        # regra de negócio: a nota precisa estar entre 0 e 10.
        # (a forma "not 0 <= nota <= 10" também recusa NaN, que passaria
        # em "nota < 0 or nota > 10" e quebraria o JSON de resposta)
        if math.isnan(nota) or not (0 <= nota <= 10):
            raise ValueError("nota deve estar entre 0 e 10")

    # monta o objeto Musica
    musica = Musica(
        titulo=textos['titulo'],
        artista=textos['artista'],
        genero=textos['genero'],
        ano=ano,
        duracao=duracao,
        nota=nota
    )

    # salva no banco de dados
    try:
        db.session.add(musica)     # coloca na "fila" para gravar
        db.session.commit()        # confirma: grava de verdade
    except Exception:
        # se a gravação falhar, desfaz para a sessão não ficar travada
        db.session.rollback()
        raise

    return musica


def retornar_musicas():
    # SELECT * FROM musica  (todas as músicas, da mais antiga à mais nova)
    return Musica.query.order_by(Musica.id).all()
