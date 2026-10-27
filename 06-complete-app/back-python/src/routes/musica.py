from config import *
from models.musica import Musica
import services.musica as musica_service

# ATENÇÃO: o nome de cada função de rota precisa ser ÚNICO em todo o projeto.
# Por isso usamos listar_musicas e criar_musica (e não repetimos nomes
# que já existem em routes/pessoa.py).

'''
-------------
LISTAR MUSICAS
-------------
'''

'''
TESTE DE ROTA - Musica - GET

curl localhost:5000/musicas
{
  "detalhes": [
    {
      "ano": 1975,
      "artista": "Queen",
      "duracao": 355,
      "genero": "Rock",
      "id": 1,
      "nota": 9.8,
      "titulo": "Bohemian Rhapsody"
    }
  ],
  "resultado": "ok"
}
'''

# rota pública (não exige login): qualquer pessoa pode listar
@app.route('/musicas', methods=['GET'])
def listar_musicas():
    musicas = musica_service.retornar_musicas()

    return jsonify({
        "resultado": "ok",
        "detalhes": [musica.json() for musica in musicas]
    })


'''
-------------
INCLUIR MUSICA
-------------
'''

'''
TESTE DE ROTA - Musica - POST (precisa da TOKEN obtida em /login)

curl http://localhost:5000/musica -X POST -H "Authorization: Bearer COLE_A_TOKEN_AQUI" -H "Content-Type:application/json" -d '{"titulo":"Bohemian Rhapsody","artista":"Queen","genero":"Rock","ano":1975,"duracao":355,"nota":9.8}'

NO WINDOWS (prompt de comando, não PowerShell):
curl.exe http://localhost:5000/musica -X POST -H "Authorization: Bearer COLE_A_TOKEN_AQUI" -H "Content-Type:application/json" -d "{\"titulo\":\"Bohemian Rhapsody\",\"artista\":\"Queen\",\"genero\":\"Rock\",\"ano\":1975,\"duracao\":355,\"nota\":9.8}"
'''

# rota protegida: @jwt_required() só deixa passar quem enviou uma token válida
@app.route('/musica', methods=['POST'])
@jwt_required()
def criar_musica():
    # silent=True: se o corpo não for JSON válido, devolve None
    # (em vez de estourar um erro 415/400 em HTML)
    dados = request.get_json(silent=True)

    # campos obrigatórios (e o corpo precisa ser um objeto JSON)
    obrigatorios = ['titulo', 'artista', 'genero', 'ano']
    if not isinstance(dados, dict) or any(dados.get(c) in (None, '') for c in obrigatorios):
        return jsonify({
            "resultado": "erro",
            "detalhes": "Título, artista, gênero e ano são obrigatórios"
        }), 400

    try:
        musica = musica_service.criar_musica(dados)
    except (ValueError, TypeError):
        # dados inválidos (ex.: texto no lugar de número, nota fora de 0-10)
        return jsonify({
            "resultado": "erro",
            "detalhes": "Dados inválidos: título, artista e gênero devem ser texto; "
                        "ano e duração devem ser números inteiros "
                        "e a nota deve ser um número entre 0 e 10"
        }), 400

    # 201 = "Created" (criado com sucesso)
    return jsonify({
        "resultado": "ok",
        "detalhes": musica.json()
    }), 201
