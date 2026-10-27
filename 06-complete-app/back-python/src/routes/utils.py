from config import *
from models.pessoa import Pessoa
# a Musica precisa ser importada aqui para o create_all() conhecer a tabela
from models.musica import Musica

# Override the missing token / unauthorized error message
@jwt.unauthorized_loader
def my_custom_unauthorized_callback(error_string):
    return jsonify({
        "resultado": "erro",
        "detalhes": "Estah faltando a TOKEN de autorizacao no cabecalho"
    }), 401

# rota padrão
@app.route('/')
def index():
    return "Backend operante :-)"

def auxiliar_criar_bd():
# é necessário "entrar" em um contexto
    with app.app_context():
        # cria as tabelas que ainda NÃO existem (pessoa e musica).
        # Se a tabela já existe, ela é mantida com os dados.
        db.create_all()

        # popula o banco com o administrador inicial,
        # mas SÓ se ele ainda não existir (assim a rota
        # pode ser chamada várias vezes sem duplicar o admin)
        if Pessoa.query.filter_by(login="admin").first() is None:
            pessoa_inicial = Pessoa(
                nome="Administrador",
                email="admin@admin",
                login="admin",
                senha=bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                telefone="(00) 0 0000-0000"
            )
            db.session.add(pessoa_inicial)
            db.session.commit()

# uma rota para criar o banco de dados, caso necessário
@app.route("/criar_banco", methods=['GET'])
def criar_banco():
    
    auxiliar_criar_bd()

    return jsonify({"resultado":"ok", 
                    "detalhes":"Banco de dados criado com sucesso!"})


# rota padrão
@app.route('/info')
def info():
    s = 'Where is the database?'
    s += app.config['SQLALCHEMY_DATABASE_URI']
    return "Info: " + s
