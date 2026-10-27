# traz tudo que foi configurado em config.py (app, db, ...)
from config import *

# A classe Musica é o MODELO: ela descreve como uma música é guardada no banco.
# "db.Model" diz ao SQLAlchemy: "esta classe vira uma TABELA no banco".
# Cada "db.Column" vira uma COLUNA da tabela.
class Musica(db.Model):
    # id: número que identifica cada música (1, 2, 3...). O banco gera sozinho.
    id = db.Column(db.Integer, primary_key=True)

    # nullable=False significa "obrigatório": não pode ficar vazio
    titulo = db.Column(db.String(200), nullable=False)
    artista = db.Column(db.String(200), nullable=False)
    genero = db.Column(db.String(100), nullable=False)
    ano = db.Column(db.Integer, nullable=False)

    # nullable=True significa "opcional": pode ficar vazio (None)
    duracao = db.Column(db.Integer, nullable=True)  # em segundos
    nota = db.Column(db.Float, nullable=True)       # de 0 a 10

    # transforma o objeto Musica em um dicionário, que o jsonify
    # consegue converter em JSON para enviar ao frontend
    def json(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "artista": self.artista,
            "genero": self.genero,
            "ano": self.ano,
            "duracao": self.duracao,
            "nota": self.nota
        }
